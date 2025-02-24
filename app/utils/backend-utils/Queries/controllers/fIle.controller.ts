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

    console.log("Files before adding thumbnail:", files);

    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        console.log("Processing file:", file.id, file.type);

        if (file.type.startsWith("image")) {
          const thumbnailBuffer = await getThumbnail(
            file.fileId,
            file.accessHash,
            file.fileReference
          );
          console.log(
            "Image Thumbnail Buffer Length:",
            thumbnailBuffer?.length
          );
          return {
            ...file,
            thumbnail: thumbnailBuffer.toString("base64"),
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

    console.log("Files after adding thumbnail:", updatedFiles);
    return updatedFiles;
  } catch (error) {
    console.error("Error in getFilesByUserId:", error);
    return { error: "Failed to get the file.", details: error };
  }
};

// fileUploader Function
export const fileUploader = async ({ file, user_id }: fileUploaderType) => {
  try {
    if (!chatId) {
      return { error: "Chat ID is not defined in environment variables" };
    }
    if (!file) throw new Error("No file provided");

    // Upload file
    const uploadedFile = await storeClient?.uploadFile({
      file,
      workers: 1, // Reduce workers to prevent overload
    });

    // Save file in messages (Optional)
    const result = await storeClient?.invoke(
      new Api.messages.UploadMedia({
        peer: chatId, // Upload to your Telegram cloud storage

        media: new Api.InputMediaUploadedDocument({
          file: uploadedFile as any,
          mimeType: file.type,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: file.name }),
          ],
        }),
      })
    );
    console.log("result,result", result);
    let fileResultToSend;
    if (result && "document" in result && result.document) {
      fileResultToSend = {
        name: file.name,
        userId: user_id,
        fileId: result?.document?.id as unknown as string,
        type:
          "mimeType" in result.document
            ? (result.document?.mimeType as string)
            : "",
        ...(result?.video && {
          thumbnail:
            "thumbs" in result.document
              ? JSON.stringify(result.document.thumbs ? true : "")
              : null,
          duration:
            "duration" in result.document
              ? "attributes" in result.document &&
                result.document.attributes[0] instanceof
                  Api.DocumentAttributeVideo
                ? (result.document.attributes[0]?.duration as
                    | number
                    | undefined)
                : undefined
              : undefined,
        }),
        accessHash:
          "accessHash" in result.document
            ? (result.document.accessHash as unknown as string)
            : "",
        fileReference:
          "fileReference" in result.document
            ? (result.document.fileReference.toString(
                "base64"
              ) as unknown as string)
            : "",
        size:
          "size" in result.document
            ? (result.document.size as unknown as string)
            : "0",
      };
    }
    console.log(fileResultToSend);

    if (!fileResultToSend) {
      throw new Error("File result is undefined");
    }

    const uploadFileToDb = await db?.file.create({
      data: fileResultToSend,
    });

    return {
      success: true,
      message: "File sent successfully!",
      data: uploadFileToDb,
      fileResultToSend,
      result,
    };
  } catch (error) {
    console.error("Error in fileUploader:", error);
    return { error: "Failed to send the file.", details: error };
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
