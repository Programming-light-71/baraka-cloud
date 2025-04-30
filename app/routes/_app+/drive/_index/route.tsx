/* eslint-disable @typescript-eslint/no-explicit-any */

// external imports
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { CloudUpload } from "lucide-react";

// internal imports
import DHeader from "~/components/drive/dHeader";
import { ModeToggle } from "~/components/theme/ToggleMode";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/utils/backend-utils/AuthProtector";
import UpgradeBanner from "~/components/drive/index/upgradeBanner";
import Dash_Recent_Folders from "~/components/drive/index/Dash_Recent_Folders";
import Dash_Pined_Folders from "~/components/drive/index/Dash_Pined_FilesOrFolders";
import Dash_Recent_Files from "~/components/drive/index/Dash_Recent_Files";
import {
  fileUploader,
  getFilesByUserId,
} from "~/utils/backend-utils/Queries/controllers/fIle.controller";
import { useDisappearUpgradeBanner } from "~/local_store+state/Drive/useDisappearUpgradeBanner";
import { useEffect } from "react";
import { getFile } from "~/utils/backend-utils/Queries/controllersHelper/getFile";
import Loading from "~/components/drive/Loading/Loading";
import toast from "react-hot-toast";
import { FileUpload } from "~/components/drive/file&Folder/FileUpload";

// action function to handle post methods
export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file");
    const intent = formData.get("download");
    // Download
    if (intent) {
      const id = formData.get("id");
      const fileName = formData.get("fileName");
      const type = formData.get("type");

      const downloadableFile = await getFile({ fileId: id as string });
      console.log("object of download", { downloadableFile, type, fileName });
      return { file: downloadableFile?.toString("base64"), type, fileName };
    } else {
      if (!file || !(file instanceof globalThis.File)) {
        return new Response(
          JSON.stringify({ error: "No file uploaded or invalid file" }),
          { status: 400 }
        );
      }

      const uploadedData = await fileUploader({
        file,
        user_id: user?.id,
      });

      if (uploadedData.error) {
        // Handle error in uploaded data
        return new Response(JSON.stringify(uploadedData), { status: 400 });
      }

      return new Response(JSON.stringify(uploadedData), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error handling file:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the file" }),
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);

  if (!user || !user?.id) return Response.redirect("/login");

  const files = await getFilesByUserId(user?.id, 5, 0);

  return { success: true, data: files };
}

export default function Index() {
  const actionResult = useActionData<typeof action>();
  const { data = [], isLoading } = useLoaderData<typeof loader>();
  const { isAppearUpgradeBanner, checkAndResetBanner } =
    useDisappearUpgradeBanner();
  const { pathname } = useLocation();

  useEffect(() => {
    toast.success(
      <pre>
        <code>{JSON.stringify(actionResult, null, 2)}</code>
      </pre>
    );
  }, [actionResult]);
  useEffect(() => {
    checkAndResetBanner();
    return () => {
      checkAndResetBanner();
    };
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <ModeToggle />

      <DHeader
        pageName="My Drive"
        pathname={pathname}
        actionData={actionResult}
        isSearch
        btn={<FileUpload />}
      />

      {isAppearUpgradeBanner && <UpgradeBanner />}
      <Dash_Recent_Folders />
      <Dash_Pined_Folders />
      <Dash_Recent_Files data={data} />

      {/* {actionResult && actionResult.success && (
        <div>
          <h1>main file</h1>
          <img
            src={actionResult.data.file_path}
            alt={actionResult.data.file_path}
            className="max-w-full border rounded"
          />
          <h1>THumbnail</h1>
          <img
            src={actionResult.data.thumbnail}
            alt={actionResult.data.file_path}
            className="max-w-full border rounded"
          />
          <h1>Thumb</h1>
          <img
            src={actionResult.data.thumb}
            alt={actionResult.data.file_path}
            className="max-w-full border rounded"
          />
        </div>
      )} */}

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
