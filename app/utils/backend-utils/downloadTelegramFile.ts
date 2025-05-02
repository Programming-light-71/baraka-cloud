// utils/downloadTelegramFile.ts
import { Api } from "telegram";
import { storeClient } from "./db.server";
// assumes setup from previous message

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
  const client = await storeClient();

  const referenceBuffer = Buffer.from(Object.values(fileReference));

  const inputDocument = new Api.InputDocumentFileLocation({
    id: BigInt(fileId),
    accessHash: BigInt(accessHash),
    fileReference: referenceBuffer,
    thumbSize: "",
  });

  const buffer = await client.downloadFile(inputDocument, {
    dcId,
    fileSize: 0,
    progressCallback: (progress) => {
      console.log(`Download Progress: ${(progress * 100).toFixed(2)}%`);
    },
  });

  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
