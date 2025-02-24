/* eslint-disable no-constant-condition */
import { Api } from "telegram";
import { storeClient } from "../../db.server";

export async function getFile(
  fileId: string,
  accessHash: string,
  fileReference: string
) {
  console.log("getFile", { fileId, accessHash, fileReference });

  let offset = 0n; // ✅ Using BigInt for offset
  const chunkSize = 1 * 1024 * 1024; // ✅ 1MB per chunk
  let fileData = Buffer.alloc(0); // ✅ Initialize empty buffer

  while (true) {
    const result = await storeClient?.invoke(
      new Api.upload.GetFile({
        location: new Api.InputDocumentFileLocation({
          id: BigInt(fileId),
          accessHash: BigInt(accessHash),
          fileReference: Buffer.from(fileReference, "base64"),
          thumbSize: "", // ✅ Required field, even if empty
        }),
        offset,
        limit: chunkSize,
      })
    );

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
