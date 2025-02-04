import { db } from "../backend-utils/db.server";

// types
interface fileUploaderType {
  file: File;
  user_id: string;
}

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

// fileUploader Function
export const fileUploader = async ({ file, user_id }: fileUploaderType) => {
  try {
    const fileName = file.name;
    const form = new FormData();
    const chatId = process.env.chat_id;

    if (!chatId) {
      return { error: "Chat ID is not defined in environment variables" };
    }

    form.append("chat_id", chatId);
    form.append("document", file);
    form.append("caption", `File: ${fileName} user:${user_id}`);

    const apiUrl = `${process.env.SERVER_FILEM_URL}sendDocument`;
    const response = await fetch(apiUrl, { method: "POST", body: form });
    const data = await response.json();

    if (!data.ok) {
      return { error: data.description || "Failed to upload file to Telegram" };
    }

    const result = data.result;
    const fileResultToSend = {
      mess_id: result.message_id,
      file_id: result.document?.file_id || result.video?.file_id,
      mime_type: result.document?.mime_type || result.video?.mime_type,
      thumbnail:
        result.document?.thumbnail?.file_id || result.video?.thumbnail?.file_id,
      file_size: result.document?.file_size || result.video?.file_size,
      duration: result.video?.duration,
      file_path: "",
    };

    const getFilePath = await getFileByFileId(fileResultToSend.file_id);
    const getThumbnailPath =
      (fileResultToSend?.mime_type?.startsWith("application") ||
        fileResultToSend?.mime_type?.includes("video")) &&
      (await getFileByFileId(fileResultToSend.thumbnail));

    const uploadFileToDb = await db?.file.create({
      data: {
        name: fileName,
        type: fileResultToSend?.mime_type,
        size: fileResultToSend?.file_size,
        userId: user_id,
        filePath: !(getFilePath instanceof Response)
          ? getFilePath?.file_path
          : undefined,
        ...((fileResultToSend?.mime_type?.startsWith("application") ||
          fileResultToSend?.mime_type?.includes("video")) && {
          thumbnail: getThumbnailPath?.file_path,
        }),
        ...(fileResultToSend?.mime_type?.includes("video") && {
          duration: fileResultToSend?.duration,
        }),
      },
    });

    if ("success" in getFilePath && getFilePath.success) {
      fileResultToSend.file_path = getFilePath.file_path;
    }
    if ("success" in getThumbnailPath && getThumbnailPath.success) {
      fileResultToSend.thumbnail = getThumbnailPath.file_path;
    }

    // console.log("uploadFileToDb", uploadFileToDb);
    // console.log("fileResultToSend", fileResultToSend);
    return {
      success: true,
      message: "File sent successfully!",
      data: uploadFileToDb,
    };
  } catch (error) {
    console.error("Error in fileUploader:", error);
    return { error: "Failed to send the file.", details: error };
  }
};

export const getFileByUserId = async (user_id: string) => {
  try {
    const files = await db?.file.findMany({
      where: { userId: user_id },
    });

    if (files?.length == 0) return { error: "No files found." };

    return { success: true, data: files };
  } catch (error) {
    console.error("Error in getFileByUserId:", error);
    return { error: "Failed to get the file.", details: error };
  }
};
