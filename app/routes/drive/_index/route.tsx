// app/routes/drive.tsx
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLocation } from "@remix-run/react";
import { CloudUpload } from "lucide-react";
import DHeader from "~/components/drive/dHeader";
import { Button } from "~/components/ui/button";

// const uniqueId = generateUniqueId();

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // Validate if the file exists and is a valid File
    if (!file || !(file instanceof File)) {
      return json({ error: "No file uploaded or invalid file" });
    }
    console.log("process?.env?.chat_id", process.env.BOT_TOKEN);
    console.log("process?.env?.chat_id", process?.env?.chat_id);
    // Read the file content as buffer
    // const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    // const fileType = file.type;

    // Prepare FormData to send to Telegram API
    const form = new FormData();
    const chatId = process.env.chat_id;
    if (!chatId) {
      return json({ error: "Chat ID is not defined in environment variables" });
    }
    form.append("chat_id", chatId);
    form.append("document", file);
    form.append("caption", `File: ${fileName}`);

    // Send the file to Telegram Bot
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument`,
      {
        method: "POST",
        body: JSON.stringify({
          chat_id: chatId,
          text: `Here is the YouTube video: https://www.youtube.com/watch?v=7hRndyMhJcA`,
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      return json({
        success: true,
        message: "File sent successfully!",
        messageId: data.result.message_id, // Get the message ID for reference
      });
    } else {
      return json({ error: "Failed to send the file.", details: data });
    }
  } catch (error) {
    console.error("Error handling file:", error);
    return json({ error: "Failed to process the file" });
  }
}

export default function Index() {
  const actionResult = useActionData<typeof action>();
  const { pathname } = useLocation();
  console.log(actionResult);

  return (
    <div>
      <DHeader
        pageName="My Drive"
        pathname={pathname}
        actionData={actionResult}
        isSearch
        btn={
          <Form
            method="post"
            encType="multipart/form-data"
            id="upload-form"
            className="relative"
          >
            <input
              type="file"
              name="file"
              id="file"
              required
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  const form = document.getElementById(
                    "upload-form"
                  ) as HTMLFormElement | null;
                  form?.submit();
                }
              }}
            />
            <Button
              className="bg-purple-700 text-white px-3 py-1 font-medium text-lg"
              type="button"
              onClick={() => document.getElementById("file")?.click()}
            >
              <CloudUpload /> Upload
            </Button>
          </Form>
        }
      />

      <pre>
        <code>{JSON.stringify(actionResult, null, 2)}</code>
      </pre>

      {/* <h1 className="text-2xl font-bold">Drive Index</h1> */}

      {/* Show uploaded file result */}
      {/* {actionResult?.success && (
        <div className="mt-4">
          <p className="text-green-600">File uploaded successfully!</p>
          <p>
            <strong>File Name:</strong> {actionResult.fileName}
          </p>
          <p>
            <strong>File Type:</strong> {actionResult.fileType}
          </p>
          <div className="mt-2">
            {actionResult.fileType.startsWith("image/") ? (
              <img
                src={`data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                alt={actionResult.fileName}
                className="max-w-full border rounded"
              />
            ) : actionResult.fileType.startsWith("video/") ? (
              <video
                controls
                className="max-w-full border rounded"
                height={400}
                width={700}
              >
                <track kind="captions" label="English" srcLang="en" />
                <source
                  src={`data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                  type={actionResult.fileType}
                />
              </video>
            ) : actionResult.fileType.startsWith("application/pdf") ? (
              <iframe
                allowFullScreen
                // srcDoc={`  data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                src={`data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                title={actionResult.fileName}
                className="max-w-full border rounded w-full h-[700px]"
              ></iframe>
            ) : (
              <a
                href={`data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                download={actionResult.fileName}
                className="text-blue-600 underline"
              >
                Download File
              </a>
            )}
          </div>
        </div>
      )} */}

      {/* Show error message */}
      {/* {actionResult?.error && (
        <p className="text-red-600 mt-4">{actionResult.error}</p>
      )} */}
    </div>
  );
}
