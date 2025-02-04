import { ActionFunction } from "@remix-run/node";

import { useActionData } from "@remix-run/react";
import { LoaderFunction } from "react-router";
import { convertFileToBase64 } from "~/utils/shared-utils/ConvertIntoBase64Formate";

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const fileUrl = formData.get("fileUrl");
  const fileName = formData.get("fileName");
  const type = formData.get("type");
  console.log("formData", formData);

  if (!fileUrl || !fileName || !type) {
    return Response.json({ error: "Missing required data" }, { status: 400 });
  }

  try {
    // Fetch and convert the file to Base64
    const base64File = await convertFileToBase64(fileUrl);

    return Response.json(
      {
        success: true,
        fileName,
        base64File,
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch or convert the file" },
      { status: 500 }
    );
  }
};
export const loader: LoaderFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const fileUrl = formData.get("fileUrl");
  const fileName = formData.get("fileName");
  const type = formData.get("type");
  console.log("formData", request);

  if (!fileUrl || !fileName || !type) {
    return Response.json({ error: "Missing required data" }, { status: 400 });
  }

  try {
    // Fetch and convert the file to Base64
    const base64File = await convertFileToBase64(fileUrl);

    return Response.json(
      {
        success: true,
        fileName,
        base64File,
        type,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch or convert the file" },
      { status: 500 }
    );
  }
};

type ActionResult = {
  success?: boolean;
  fileName?: string;
  type?: string;
  fileBase64?: string;
  error?: string;
};

export default function Download() {
  const actionResult = useActionData<ActionResult>();
  console.log(actionResult);
  return (
    <div>
      <h1 className="text-2xl font-bold">Download Page</h1>

      {/* Show uploaded file result */}
      {actionResult?.success && (
        <div className="mt-4">
          <p className="text-green-600">File uploaded successfully!</p>
          <p>
            <strong>File Name:</strong> {actionResult.fileName}
          </p>
          <p>
            <strong>File Type:</strong> {actionResult?.type}
          </p>
          <div className="mt-2">
            {actionResult?.type?.startsWith("image/") ? (
              <img
                src={`data:${actionResult.type};base64,${actionResult.fileBase64}`}
                alt={actionResult.fileName}
                className="max-w-full border rounded"
              />
            ) : actionResult?.type?.startsWith("video/") ? (
              <video
                controls
                className="max-w-full border rounded"
                height={400}
                width={700}
              >
                <track kind="captions" label="English" srcLang="en" />
                <source
                  src={`data:${actionResult.type};base64,${actionResult.fileBase64}`}
                  type={actionResult.type}
                />
              </video>
            ) : actionResult?.type?.startsWith("application/pdf") ? (
              <iframe
                allowFullScreen
                // srcDoc={`  data:${actionResult.fileType};base64,${actionResult.fileBase64}`}
                src={`data:${actionResult.type};base64,${actionResult.fileBase64}`}
                title={actionResult.fileName}
                className="max-w-full border rounded w-full h-[700px]"
              ></iframe>
            ) : (
              <a
                href={`data:${actionResult.type};base64,${actionResult.fileBase64}`}
                download={actionResult.fileName}
                className="text-blue-600 underline"
              >
                Download File
              </a>
            )}
          </div>
        </div>
      )}

      {/* Show error message */}
      {actionResult?.error && (
        <p className="text-red-600 mt-4">{actionResult.error}</p>
      )}
    </div>
  );
}
