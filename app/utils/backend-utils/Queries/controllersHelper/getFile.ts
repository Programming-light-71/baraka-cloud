/* eslint-disable no-constant-condition */
import { Api } from "telegram";
import { db } from "../../db.server";
import { telegram } from "../../../../services/telegram.server";
import { invokeWithRetry } from "./invokeWithRetry";

export async function invokeWithRetry(
  method,
  params,
  maxRetries = 5,
  delay = 5000
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await telegram?.invoke(new method(params));
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
        await telegram.destroy();
        await telegram.start(); // Re-authenticate
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

export async function getFile(method: any, params: any) {
  try {
    if (!telegram?.connected) {
      throw new Error("Telegram client is not connected");
    }
    return await telegram?.invoke(new method(params));
  } catch (error: any) {
    if (error.message.includes("AUTH_KEY_UNREGISTERED")) {
      // Attempt to reconnect
      await telegram.destroy();
      await telegram.start(); // Re-authenticate
      return await invokeWithRetry(method, params);
    }
    throw error;
  }
}

export async function getFileById(fileId: string, userId: string) {
  try {
    if (!telegram?.connected) {
      throw new Error("Telegram client is not connected");
    }

    // Validate store client
    if (!telegram?.connected) {
      throw new Error("Telegram client not properly initialized");
    }

    // 1. Retrieve file metadata with transaction
    const fileData = await db.$transaction(async (tx) => {
      const data = await tx.file.findUnique({
        where: { id: fileId },
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          fileId: true,
          accessHash: true,
          dcId: true,
          fileReference: true,
          messageId: true,
          lastUpdatedAt: true,
        },
      });

      if (!data) throw new Error("File not found in database");
      return data;
    });

    // 2. Enhanced file reference converter
    const getFileReferenceBuffer = (): Buffer => {
      try {
        const ref = fileData.fileReference;

        // Handle all possible reference formats
        if (ref instanceof Buffer) return ref;
        if (ref instanceof Uint8Array) return Buffer.from(ref);
        if (typeof ref === "string") {
          // Detect if it's already base64
          if (/^[A-Za-z0-9+/]+={0,2}$/.test(ref)) {
            return Buffer.from(ref, "base64");
          }
          return Buffer.from(ref);
        }
        if (Array.isArray(ref)) return Buffer.from(new Uint8Array(ref));

        throw new Error(`Unknown reference type: ${typeof ref}`);
      } catch (error) {
        console.error("File reference conversion failed:", {
          error,
          fileId: fileData.id,
          referenceType: typeof fileData.fileReference,
        });
        throw new Error("File reference format invalid");
      }
    };

    // 3. Download executor with enhanced retry logic
    const downloadExecutor = async (attempt = 1): Promise<Buffer> => {
      try {
        const fileReference = getFileReferenceBuffer();
        const fileSize = parseInt(fileData.size) || 0;

        // Dynamic chunk sizing for optimal performance
        const chunkSize = Math.min(
          Math.max(
            512 * 1024, // Minimum 512KB
            Math.min(8 * 1024 * 1024, fileSize / 8)
          ) // Max 8MB or 1/8th of file
        );

        const location = new Api.InputDocumentFileLocation({
          id: BigInt(fileData.fileId),
          accessHash: BigInt(fileData.accessHash),
          fileReference,
          thumbSize: "",
          dcId: fileData.dcId,
        });

        // Sequential download with progress tracking (more reliable than parallel)
        let offset = 0;
        const chunks: Buffer[] = [];
        const startTime = Date.now();

        while (offset < fileSize) {
          const chunk = await telegram.invoke(
            new Api.upload.GetFile({
              location,
              offset,
              limit: chunkSize,
            }),
            { noErrorBox: true } // Prevent Telegram error popups
          );

          if (!chunk?.bytes?.length) {
            if (offset === 0) throw new Error("Empty response from server");
            break; // Reached end of file
          }

          chunks.push(chunk.bytes);
          offset += chunk.bytes.length;

          // Progress logging
          if (Date.now() - startTime > 5000) {
            // Log every 5 seconds
            console.log(
              `Download progress: ${Math.round((offset / fileSize) * 100)}%`
            );
          }
        }

        // Validate downloaded size
        const totalDownloaded = chunks.reduce(
          (sum, chunk) => sum + chunk.length,
          0
        );
        if (fileSize > 0 && totalDownloaded < fileSize * 0.9) {
          throw new Error(
            `Incomplete download (${totalDownloaded}/${fileSize} bytes)`
          );
        }

        return Buffer.concat(chunks);
      } catch (error) {
        console.error(`Download attempt ${attempt} failed:`, error);

        // Refresh reference and retry (max 2 retries)
        if (attempt < 3) {
          if (fileData.messageId) {
            await refreshFileReference(fileData);
            return downloadExecutor(attempt + 1);
          }
          throw new Error("Cannot refresh - missing messageId");
        }
        throw error;
      }
    };

    // 4. Execute download with monitoring
    const fileBuffer = await downloadExecutor();

    return {
      success: true,
      file: fileBuffer,
      fileName: fileData.name,
      mimeType: fileData.type,
      size: fileBuffer.length,
    };
  } catch (error: any) {
    // Enhanced error reporting
    const errorDetails = {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fileId,
      timestamp: new Date().toISOString(),
    };

    console.error("File download failed:", errorDetails);

    return {
      success: false,
      error: "Failed to download file",
      details: error.message,
      ...(process.env.NODE_ENV === "development" && { debug: errorDetails }),
    };
  }
}

// Enhanced reference refresher
async function refreshFileReference(fileData: any) {
  try {
    console.log(`Refreshing reference for file ${fileData.id}...`);

    const result = await telegram.invoke(
      new Api.messages.GetMessages({
        id: [new Api.InputMessageID({ id: parseInt(fileData.messageId) })],
      }),
      { noErrorBox: true }
    );

    const message = result?.messages?.[0];
    if (!message?.media?.document) {
      throw new Error("No document found in message");
    }

    const doc = message.media.document;
    const newReference = Buffer.from(doc.fileReference);

    await db.$transaction(async (tx) => {
      await tx.file.update({
        where: { id: fileData.id },
        data: {
          fileReference: newReference,
          fileId: doc.id.toString(),
          accessHash: doc.accessHash.toString(),
          dcId: doc.dcId,
          lastUpdatedAt: new Date(),
        },
      });
    });

    console.log(`Successfully refreshed reference for ${fileData.id}`);
    return true;
  } catch (error) {
    console.error("Reference refresh failed:", {
      error: error.message,
      fileId: fileData.id,
      messageId: fileData.messageId,
    });
    throw new Error("Could not refresh file reference");
  }
}
