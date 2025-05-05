// utils/downloadTelegramFile.ts
import { Api } from "telegram";
import { telegram } from "../../services/telegram.server";

export async function downloadTelegramFile({
  fileId,
  accessHash,
  fileReference,
  dcId,
  fileName,
}: {
  fileId: string;
  accessHash: string;
  fileReference: Record<string, number>;
  dcId: number;
  fileName: string;
}) {
  try {
    const inputFileLocation = new Api.InputDocumentFileLocation({
      id: fileId,
      accessHash,
      fileReference: Buffer.from(Object.values(fileReference)),
      thumbSize: "",
    });

    const file = await telegram.downloadFile(dcId, {
      location: inputFileLocation,
      dcId,
      fileSize: 0,
      workers: 1,
    });

    // Create a download URL for the file
    const blob = new Blob([file]);
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}
