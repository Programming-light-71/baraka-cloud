/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from "telegram";
import { telegram } from "~/services/telegram.server";

export async function downloadTelegramFile(file: any) {
  const result = await telegram.downloadFile({
    dcId: file.dcId,
    fileReference: file.fileReference,
    fileSize: file.size,
    location: new Api.InputDocumentFileLocation({
      id: BigInt(file.fileId),
      accessHash: BigInt(file.accessHash),
      fileReference: file.fileReference,
    }),
  });

  return new Response(result, {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${file.name}"`,
    },
  });
}
