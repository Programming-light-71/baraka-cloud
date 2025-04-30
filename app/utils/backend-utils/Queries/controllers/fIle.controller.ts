/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, storeClient } from "../../db.server";
import { Api } from "telegram";
import { getThumbnail } from "../controllersHelper/getThumbnail";
import { getFile } from "../controllersHelper/getFile";

// types
interface fileUploaderType {
  file: File;
  user_id: string;
}

// env variables
// chat Id
const chatId = process.env.chat_id;

/*====================================================
=|| ///////////////////////////_ Functions >>> utils _///////////////////////////////// ||=
====================================================*/

// getFileByFileId
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
    const files = await db?.file.findMany({
      where: { userId: user_id, ...filter },
      ...(take && { take }),
      ...(skip && { skip: skip || 0 }),
    });

    if (!files || files.length === 0) return { error: "No files found." };

    // console.log("Files before adding thumbnail:", files);

    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        console.log("Processing file:", file.id, file.type);

        if (file.type.startsWith("image")) {
          // const thumbnailBuffer = await getThumbnail(
          //   file.fileId,
          //   file.accessHash,
          //   file.fileReference
          // );
          // console.log(
          //   "Image Thumbnail Buffer Length:",
          //   thumbnailBuffer?.length
          // );
          return {
            ...file,
            thumbnail: "", //thumbnailBuffer.toString("base64"),
          };
        }

        if (file.type.startsWith("video")) {
          const thumbnailBuffer = await getThumbnail(
            file.fileId,
            file.accessHash,
            file.fileReference
          );
          console.log(
            "Video Thumbnail Buffer Length:",
            thumbnailBuffer?.length
          );
          return {
            ...file,
            thumbnail: thumbnailBuffer.toString("base64"),
          };
        }

        return file;
      })
    );

    // console.log("Files after adding thumbnail:", updatedFiles);
    return updatedFiles;
  } catch (error) {
    console.error("Error in getFilesByUserId:", error);
    return { error: "Failed to get the file.", details: error };
  }
};

export const fileUploader = async ({ file, user_id }: fileUploaderType) => {
  try {
    if (!chatId)
      throw new Error("Chat ID not found in the environment variables");
    if (!file) throw new Error("No file provided");
    if (!storeClient) throw new Error("storeClient is not initialized");

    // **Upload file**
    const uploadedFile = await storeClient.uploadFile({ file, workers: 1 });

    if (!uploadedFile) throw new Error("File upload failed");

    // **Send file as a message**
    const result = await storeClient.invoke(
      new Api.messages.SendMedia({
        peer: chatId,
        media: new Api.InputMediaUploadedDocument({
          file: uploadedFile as any,
          mimeType: file.type,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: file.name }),
          ],
        }),
        message: "",
        randomId: BigInt(Math.floor(Math.random() * 1e18)),
      })
    );

    console.log("Upload result:", result);

    if (!result?.updates?.length)
      throw new Error("Failed to retrieve message ID.");

    // **Extract message ID properly**
    const messageUpdate = result.updates.find(
      (update) => update.className === "UpdateNewChannelMessage"
    );

    if (!messageUpdate || !messageUpdate.message || !messageUpdate.message.id) {
      throw new Error("Message ID not found.");
    }

    const message = messageUpdate.message;
    const document = message.media?.document;
    if (!document) throw new Error("Document not found in message.");

    // **Extract permanent references**
    const fileId = document.id.toString();
    const accessHash = document.accessHash.toString();
    const dcId = document.dcId; // ✅ New: Store required dcId
    const fileReference = Buffer.from(document.fileReference).toString(
      "base64"
    ); // ✅ Store safely

    // **Store file info in DB**
    const uploadedFileToDb = await db?.file.create({
      data: {
        name: file.name,
        userId: user_id,
        type: file.type,
        size: file.size.toString(),
        fileId: document.id.toString(),
        accessHash: document.accessHash.toString(),
        dcId: document.dcId,
        fileReference: Buffer.from(document.fileReference),
        messageId: messageUpdate.message.id.toString(), // Add this line
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
