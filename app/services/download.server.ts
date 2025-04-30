import { Api } from "telegram";
import { telegram, prisma } from "./telegram.server";
import { Readable } from "stream";
import { Buffer } from "buffer";

export async function downloadFile(fileId: string) {
  // Get file metadata from database
  const file = await prisma.file.findUniqueOrThrow({
    where: { id: fileId },
    select: {
      fileId: true,
      accessHash: true,
      dcId: true,
      fileReference: true,
      messageId: true,
      size: true,
      name: true,
      type: true,
    },
  });

  // Get file location (with automatic reference refresh)
  const location = await getFileLocationWithRefresh(file);

  // Download the entire file at once (for smaller files)
  const fileResult = await telegram.invoke(
    new Api.upload.GetFile({
      location,
      offset: 0,
      limit: file.size,
    })
  );

  if (!fileResult?.bytes) {
    throw new Error("No file data received");
  }

  // Convert to base64 for the frontend
  const base64Data = Buffer.from(fileResult.bytes).toString("base64");

  return {
    file: base64Data,
    type: file.type,
    fileName: file.name,
  };
}

async function getFileLocationWithRefresh(
  file: any,
  attempt = 1
): Promise<Api.InputDocumentFileLocation> {
  try {
    return new Api.InputDocumentFileLocation({
      id: BigInt(file.fileId),
      accessHash: BigInt(file.accessHash),
      fileReference: file.fileReference as Buffer,
      thumbSize: "",
      dcId: file.dcId,
    });
  } catch (error) {
    if (attempt > 3) {
      throw new Error("Failed to get file location after multiple attempts");
    }

    if (error.message.includes("FILE_REFERENCE_EXPIRED") && file.messageId) {
      console.log("File reference expired, refreshing...");
      await refreshFileReference(file);
      return getFileLocationWithRefresh(file, attempt + 1);
    }

    throw error;
  }
}

async function refreshFileReference(file: any) {
  const result = await telegram.invoke(
    new Api.messages.GetMessages({
      id: [new Api.InputMessageID({ id: parseInt(file.messageId) })],
    })
  );

  const doc = result.messages[0].media.document;
  await prisma.file.update({
    where: { fileId: file.fileId },
    data: {
      fileReference: Buffer.from(doc.fileReference),
    },
  });
}
