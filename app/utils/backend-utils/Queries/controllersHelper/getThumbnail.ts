import { Api } from "telegram";
import { telegram } from "../../../../services/telegram.server";

export async function getThumbnail(
  fileId: string,
  accessHash: string,
  fileRef: Record<string, number>,
  dcId: number
) {
  try {
    const inputPhotoFileLocation = new Api.InputPhotoFileLocation({
      id: fileId,
      accessHash,
      fileReference: Buffer.from(Object.values(fileRef)),
      thumbSize: "m",
    });

    const result = await telegram.downloadFile(dcId, {
      location: inputPhotoFileLocation,
      dcId,
      fileSize: 0,
      workers: 1,
    });

    return result;
  } catch (error) {
    console.error("Error getting thumbnail:", error);
    throw error;
  }
}
