/* eslint-disable no-constant-condition */
import { Api } from "telegram";
import { storeClient } from "../../db.server";

export async function getThumbnail(
  fileId: string,
  accessHash: string,
  fileReference: string
) {
  if (!fileId || !accessHash || !fileReference) {
    throw new Error(
      "Invalid input: fileId, accessHash, and fileReference are required."
    );
  }

  console.log("Fetching thumbnail:", { fileId, accessHash });

  let offset = 0n;
  const chunkSize = 64 * 1024; // ✅ 64KB per request (optimized for thumbnails)
  let thumbnailData = Buffer.alloc(0);

  while (true) {
    const result = await storeClient?.invoke(
      new Api.upload.GetFile({
        location: new Api.InputDocumentFileLocation({
          id: BigInt(fileId),
          accessHash: BigInt(accessHash),
          fileReference: Buffer.from(fileReference, "base64"),
          thumbSize: "m", // ✅ Fetch medium-sized thumbnail
        }),
        offset,
        limit: chunkSize,
      })
    );

    if (!result?.bytes) {
      throw new Error("No thumbnail data received.");
    }

    thumbnailData = Buffer.concat([thumbnailData, Buffer.from(result.bytes)]);
    offset += BigInt(chunkSize);

    if (result.bytes.length < chunkSize) {
      break; // ✅ Stop when last chunk is smaller than chunkSize
    }
  }

  console.log(`Thumbnail fetched: ${thumbnailData.length} bytes`);
  return thumbnailData;
}
