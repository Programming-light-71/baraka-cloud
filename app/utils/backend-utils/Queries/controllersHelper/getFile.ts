/* eslint-disable no-constant-condition */
import { Api } from "telegram";
import { storeClient } from "../../db.server";

export async function invokeWithRetry(
  method,
  params,
  maxRetries = 5,
  delay = 5000
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await storeClient?.invoke(new method(params));
    } catch (error) {
      const errorMsg = error.message.toUpperCase();

      // Handle FLOOD_WAIT_X
      const floodWaitMatch = errorMsg.match(/FLOOD_WAIT_(\d+)/);
      if (floodWaitMatch) {
        const waitTime = parseInt(floodWaitMatch[1], 10);
        console.warn(
          `Rate limited! Waiting ${waitTime} seconds before retrying...`
        );
        await new Promise((res) => setTimeout(res, waitTime * 1000));
        attempt++;
        continue;
      }

      // Handle AUTH_KEY_UNREGISTERED (session expired)
      if (errorMsg.includes("AUTH_KEY_UNREGISTERED")) {
        console.error("Session expired! Reauthenticating...");
        await storeClient.destroy();
        await storeClient.start(); // Re-authenticate
        continue;
      }

      // Handle TIMEOUT, Not connected, and RPC failures
      if (
        errorMsg.includes("TIMEOUT") ||
        errorMsg.includes("NOT CONNECTED") ||
        errorMsg.includes("RPC_CALL_FAIL")
      ) {
        console.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${
            delay / 1000
          } seconds...`
        );
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
      } else {
        throw error; // If error is not retryable, throw it immediately
      }
    }
  }
  throw new Error(
    `Max retry attempts (${maxRetries}) reached for ${method.name}`
  );
}

export async function getFile(fileId, accessHash, fileReference) {
  console.log("getFile", { fileId, accessHash, fileReference });

  let offset = 0n; // ✅ Using BigInt for offset
  const chunkSize = 1 * 1024 * 1024; // ✅ 1MB per chunk
  let fileData = Buffer.alloc(0); // ✅ Initialize empty buffer

  // Validate Base64 fileReference
  try {
    const fileReferenceBuffer = Buffer.from(fileReference, "base64");
    if (fileReferenceBuffer.toString("base64") !== fileReference) {
      throw new Error("Invalid Base64 fileReference");
    }
  } catch (error) {
    throw new Error("Invalid Base64 encoding in fileReference.");
  }

  while (true) {
    const result = await invokeWithRetry(Api.upload.GetFile, {
      location: new Api.InputDocumentFileLocation({
        id: BigInt(fileId),
        accessHash: BigInt(accessHash),
        fileReference: Buffer.from(fileReference, "base64"),
        thumbSize: "",
      }),
      offset,
      limit: chunkSize,
    });

    if (!result?.bytes) {
      throw new Error("No file data received.");
    }

    fileData = Buffer.concat([fileData, Buffer.from(result.bytes)]); // ✅ Append chunk data
    offset += BigInt(chunkSize); // ✅ Move to next chunk

    if (result.bytes.length < chunkSize) {
      // ✅ If last chunk is smaller than chunkSize, stop downloading
      break;
    }
  }

  return fileData;
}
