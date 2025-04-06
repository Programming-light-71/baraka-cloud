import { Api } from "telegram";
import { storeClient } from "../../db.server";

export async function getThumbnail(
  fileId: string,
  accessHash: string,
  fileReference: string,
  retryCount: number = 3 // Retry attempts for expired references
) {
  if (!fileId || !accessHash || !fileReference) {
    throw new Error(
      "Invalid input: fileId, accessHash, and fileReference are required."
    );
  }

  let offset = 0n;
  const chunkSize = 64 * 1024;
  let thumbnailData = Buffer.alloc(0);
  let attempts = 0;

  while (true) {
    try {
      const result = await storeClient?.invoke(
        new Api.upload.GetFile({
          location: new Api.InputDocumentFileLocation({
            id: BigInt(fileId),
            accessHash: BigInt(accessHash),
            fileReference: Buffer.from(fileReference, "base64"),
            thumbSize: "m",
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
        break;
      }
    } catch (error: any) {
      console.error(`Error fetching thumbnail for fileId ${fileId}:`, error);

      if (
        attempts < retryCount &&
        error.message.includes("FILE_REFERENCE_EXPIRED")
      ) {
        console.log(`File reference expired. Retrying to fetch thumbnail...`);

        try {
          // Get fresh file metadata to get a new file reference
          const fileMetadata = await storeClient?.invoke(
            new Api.messages.GetMessages({
              id: [BigInt(fileId)],
            })
          );

          const newFileReference =
            fileMetadata?.messages[0]?.media?.fileReference || fileReference;
          console.log("Refreshing file reference.");

          attempts += 1;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts) * 1000)
          );

          // Retry fetching the thumbnail with the new file reference
          return getThumbnail(fileId, accessHash, newFileReference, retryCount);
        } catch (innerError) {
          console.error("Error fetching fresh file reference:", innerError);
          throw new Error(
            `Failed to refresh file reference: ${innerError.message}`
          );
        }
      }

      throw new Error(
        `Failed to fetch thumbnail after ${attempts} retries: ${error.message}`
      );
    }
  }

  return thumbnailData;
}
