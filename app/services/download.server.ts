import { Api } from "telegram";
import { telegram, prisma } from "./telegram.server";
import { Buffer } from "buffer";
import { convertBufferToBase64 } from "~/utils/shared-utils/ConvertIntoBase64Formate";

interface FileMetadata {
  fileId: string;
  accessHash: string;
  dcId: number;
  fileReference: Buffer;
  messageId: string | null;
  size: number;
  name: string;
  type: string;
  id: string;
}

const fileMetadataCache = new Map<string, FileMetadata>();

export async function downloadFile(
  fileId: string,
  progressCallback?: (progress: number) => void
) {
  // Check if file metadata is in cache
  let fileMetadata: FileMetadata | undefined = fileMetadataCache.get(fileId);

  if (!fileMetadata) {
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
        id: true,
      },
    });

    fileMetadata = {
      fileId: String(file.fileId),
      accessHash: String(file.accessHash),
      dcId: Number(file.dcId),
      fileReference: Buffer.from(file.fileReference),
      messageId: file.messageId,
      size: file.size,
      name: file.name,
      type: file.type,
      id: file.id,
    };

    // Store file metadata in cache
    fileMetadataCache.set(fileId, fileMetadata);
  }

  // Get file location (with automatic reference refresh)
  const location = await getFileLocationWithRefresh(fileMetadata);

  const chunkSize = 1024 * 1024; // 1MB
  let offset = 0;
  let downloadedBytes = 0;
  const chunks: Buffer[] = [];

  try {
    while (downloadedBytes < fileMetadata.size) {
      const limit = Math.min(chunkSize, fileMetadata.size - downloadedBytes);

      const fileResult: any = await telegram.invoke(
        new Api.upload.GetFile({
          location,
          offset,
          limit,
        })
      );

      if (fileResult instanceof Api.upload.File) {
        const buffer = Buffer.from(fileResult.bytes);
        chunks.push(buffer);
        downloadedBytes += buffer.length;
        offset += buffer.length;

        const progress = Math.round(
          (downloadedBytes / fileMetadata.size) * 100
        );
        console.log(
          `Downloaded ${downloadedBytes} bytes / ${fileMetadata.size} bytes (${progress}%)`
        );
      } else {
        throw new Error("Unexpected file result type");
      }
    }

    const file = Buffer.concat(chunks);

    return {
      file,
      type: fileMetadata.type,
      fileName: fileMetadata.name,
    };
  } catch (error: any) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file");
  }
}

async function getFileLocationWithRefresh(
  file: FileMetadata,
  attempt = 1
): Promise<Api.InputDocumentFileLocation> {
  try {
    if (!file.fileReference) {
      console.error("file.fileReference is undefined");
      throw new Error("file.fileReference is undefined");
    }
    let id = String(file.fileId);
    let accessHash = String(file.accessHash);
    const fileLocation = new Api.InputDocumentFileLocation({
      id: BigInt(id),
      accessHash: BigInt(accessHash),
      fileReference: file.fileReference,
      thumbSize: "",
    });
    return fileLocation;
  } catch (error: any) {
    console.log(error);
    if (attempt > 3) {
      throw new Error("Failed to get file location after multiple attempts");
    }

    if (error.message?.includes("FILE_REFERENCE_EXPIRED") && file.messageId) {
      console.log("File reference expired, refreshing...");
      await refreshFileReference(file);
      return getFileLocationWithRefresh(file, attempt + 1);
    }

    throw error;
  }
}

async function refreshFileReference(file: FileMetadata) {
  const result: any = await telegram.invoke(
    new Api.messages.GetMessages({
      id: [new Api.InputMessageID({ id: parseInt(file.messageId || "0") })],
    })
  );

  if (!result?.messages) {
    throw new Error("No messages received");
  }

  if (result?.messages && result.messages[0]?.media?.document) {
    const doc = result.messages[0].media.document;
    await prisma.file.update({
      where: { id: file.id },
      data: {
        fileReference: Buffer.from(doc.fileReference),
      },
    });
  } else {
    console.warn(
      "Could not refresh file reference, missing messages or document"
    );
  }
}
