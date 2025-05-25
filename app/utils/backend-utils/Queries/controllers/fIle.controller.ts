/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from "telegram";
import { db } from "../../db.server";
import { telegram } from "../../../../services/telegram.server";
import { getThumbnail } from "../controllersHelper/getThumbnail";

// types
interface fileUploaderType {
  file: File;
  user_id: string;
}

/*====================================================
=|| ///////////////////////////_ Functions >>> utils _///////////////////////////////// ||=
====================================================*/

// getFileByFileId

export async function getFileById(id: string) {
  try {
    const file = await db.file.findUnique({
      where: { id },
    });

    return file;
  } catch (error) {
    console.error("Error in getFileById:", error);
    return null;
  }
}

export const getFileByFileId = async (fileId: string, isUrl?: boolean) => {
  // console.log("fileId", fileId);
  const response = await fetch(
    process.env.SERVER_FILEM_URL + `getFile?file_id=${fileId}`
  );
  const data = await response.json();

  if (data.ok) {
    return {
      success: true,
      file_path: isUrl
        ? `${process.env.SERVER_FILED_URL}${data?.result?.file_path}`
        : data?.result?.file_path,
    };
  } else {
    return Response.json({ error: "Failed to get the file.", details: data });
  }
};
// by userId
export const getFilesByUserId = async (
  user_id: string,
  take?: number,
  skip?: number,
  filter?: object
) => {
  try {
    const files = (await db?.file.findMany({
      where: { userId: user_id, ...filter },
      select: {
        id: true,
        name: true,
        userId: true,
        type: true,
        size: true,
        fileId: true,
        accessHash: true,
        dcId: true,
        fileReference: true,
        messageId: true,
        createdAt: true,
        updatedAt: true,
      },
      ...(take && { take }),
      ...(skip && { skip: skip || 0 }),
    })) as any;

    if (!files || files.length === 0) {
      return { error: "No files found." };
    }

    // console.log("Files before adding thumbnail:", files);

    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        // Decode fileReference from base64
        const decodedFileReference = file.fileReference
          ? Buffer.from(file.fileReference, "base64").toString("utf-8")
          : "";

        console.log("Processing file:", file.id, file.type);

        if (file.type.startsWith("image")) {
          return {
            ...file,
            fileReference: decodedFileReference,
            thumbnail: "",
          };
        }

        if (file.type.startsWith("video")) {
          const thumbnailBuffer = await getThumbnail(
            file.fileId,
            file.accessHash,
            file.fileReference,
            file.dcId
          );
          console.log(
            "Video Thumbnail Buffer Length:",
            thumbnailBuffer?.length
          );
          return {
            ...file,
            fileReference: decodedFileReference,
            thumbnail: thumbnailBuffer?.toString("base64"),
          };
        }

        return {
          ...file,
          fileReference: decodedFileReference,
        };
      })
    );

    // console.log("Files after adding thumbnail:", updatedFiles);
    return updatedFiles;
  } catch (error) {
    console.error("Error in getFilesByUserId:", error);
    return { error: "Failed to get the file.", details: error };
  }
};

export async function uploadFileToTelegram(file: globalThis.File) {
  try {
    if (!telegram) throw new Error("Telegram client is not initialized");

    const uploadedFile = await telegram.uploadFile({ file, workers: 1 });

    const result = (await telegram.invoke(
      new Api.messages.SendMedia({
        peer: process.env.TELEGRAM_STORAGE_CHAT_ID,
        media: new Api.InputMediaUploadedDocument({
          file: uploadedFile,
          mimeType: file.type,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: file.name }),
          ],
          forceFile: true,
        }),
        message: `Uploaded ${file.name}`,
        randomId: BigInt(Math.floor(Math.random() * 1e18)) as any,
      })
    )) as any;

    if (!result?.updates?.length)
      throw new Error("Failed to retrieve message ID.");

    const messageUpdate = (result.updates as any).find(
      (update: any) => update.className === "UpdateNewChannelMessage"
    ) as any;

    if (!messageUpdate || !messageUpdate.message || !messageUpdate.message.id) {
      throw new Error("Message ID not found.");
    }

    const message = messageUpdate.message;
    const document = message.media?.document;
    if (!document) throw new Error("Document not found in message.");

    const fileId = document.id.toString();
    const accessHash = document.accessHash.toString();
    const dcId = document.dcId;
    const fileReference = Buffer.from(document.fileReference).toString(
      "base64"
    );

    return {
      fileId,
      accessHash,
      dcId,
      fileReference,
      messageId: messageUpdate.message.id.toString(),
    };
  } catch (error: any) {
    console.error("Error in uploadFileToTelegram:", error);
    throw new Error(error.message || "Failed to upload file to Telegram");
  }
}

export const fileUploader = async ({ file, user_id }: fileUploaderType) => {
  try {
    if (!file) throw new Error("No file provided");

    const { fileId, accessHash, dcId, fileReference, messageId } =
      await uploadFileToTelegram(file);

    const uploadedFileToDb = await db?.file.create({
      data: {
        name: file.name,
        userId: user_id,
        type: file.type,
        size: file.size.toString(),
        fileId,
        accessHash,
        dcId,
        fileReference: fileReference,
        messageId,
      },
    });

    return {
      success: true,
      message: "File uploaded successfully!",
      data: uploadedFileToDb,
    };
  } catch (error: any) {
    console.error("Error in fileUploader:", error);
    return {
      error: "Failed to send the file.",
      details: error.message || error,
    };
  }
};

// export async function dbGetFile(params: type) {}
// export async function dbPostFile(params: type) {}
export async function dbUpdateFile({
  query,
  data,
}: {
  data: any;
  query: { id: string };
}) {
  try {
    const updateFileResult = await db?.file.update({
      where: { ...query },
      data: { ...data },
    });

    return updateFileResult;
  } catch (error) {
    console.log(error);
  }
}

// export async function dbDeleteFile(params: type) {}
