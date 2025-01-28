// types
import { json } from "@remix-run/node";
interface fileUploaderType {
  file: File;
  user_id: string;
}

/*====================================================
||| //////////////////////////// Functions >>> utils /////////////////////////////////// |||
====================================================*/

// getFileByFileId
export const getFileByFileId = async (fileId: string, isUrl?: boolean) => {
  console.log("fileId", fileId);
  const response = await fetch(
    process.env.SERVER_FILEM_URL + `getFile?file_id=${fileId}`
  );
  const data = await response.json();

  if (data.ok) {
    return {
      success: true,
      file_path: isUrl
        ? `${process.env.SERVER_FILED_URL}/${data?.result?.file_path}`
        : data?.result?.file_path,
    };
  } else {
    return json({ error: "Failed to get the file.", details: data });
  }
};

// fileUploader Function
export const fileUploader = async ({ file, user_id }: fileUploaderType) => {
  try {
    const fileName = file.name;
    const form = new FormData();
    const chatId = process.env.chat_id;

    if (!chatId) {
      return json({ error: "Chat ID is not defined in environment variables" });
    }

    form.append("chat_id", chatId);
    form.append("document", file);
    form.append("caption", `File: ${fileName} user:${user_id}`);

    const apiUrl = `${process.env.SERVER_FILEM_URL}sendDocument`;

    const response = await fetch(apiUrl, {
      method: "POST",
      body: form,
      headers: form?.getHeaders ? form?.getHeaders() : {},
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data.description);
      return json({ error: data.description, details: data });
    }

    const result = data.result;
    const fileResultToSend = {
      mess_id: result.message_id,
      file_id: result.document?.file_id || result.video?.file_id,
      mime_type: result.document?.mime_type || result.video?.mime_type,
      thumbnail: result.document?.thumb?.file_id || null,
      thumb: result.document?.thumb?.file_id || null,
      ...(result.video?.duration && {
        duration: result.video?.duration || null,
      }),
      file_size: result.document?.file_size || result.video?.file_size,
      file_path: "",
    };

    if (fileResultToSend.file_id) {
      const getFilePath = await getFileByFileId(fileResultToSend.file_id, true);
      const getThumbnailPath = await getFileByFileId(
        fileResultToSend.thumbnail,
        true
      );

      if ("success" in getFilePath && getFilePath.success) {
        fileResultToSend.file_path = getFilePath.file_path;
      }
      if ("success" in getThumbnailPath && getThumbnailPath.success) {
        fileResultToSend.thumbnail = getThumbnailPath.file_path;
      }

      return {
        success: true,
        message: "File sent successfully!",
        data: fileResultToSend,
      };
    }

    return { error: "Failed to process the file.", details: data };
  } catch (error) {
    console.error("Error in fileUploader:", error);
    return { error: "Failed to send the file.", details: error };
  }
};
