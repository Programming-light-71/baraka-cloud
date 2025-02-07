/* eslint-disable @typescript-eslint/no-explicit-any */
// app/routes/drive.tsx

import type { File as FileType } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { CloudUpload, Loader } from "lucide-react";

import { Suspense } from "react";
import DHeader from "~/components/drive/dHeader";
import File from "~/components/drive/file&Folder/file";

import { ModeToggle } from "~/components/theme/ToggleMode";
import { Button } from "~/components/ui/button";
import { useIsListStore } from "~/local_store+state/listToggle";
import { requireAuth } from "~/utils/backend-utils/AuthProtector";
import { convertFileToBase64 } from "~/utils/shared-utils/ConvertIntoBase64Formate";
import { getDownloadableURL } from "~/utils/shared-utils/convertToDownloadableURL";

import UpgradeBanner from "~/components/drive/index/upgradeBanner";
import {
  fileUploader,
  getFileByUserId,
} from "~/utils/shared-utils/fileHandlerController";
import Dash_Recent_Folders from "~/components/drive/index/Dash_Recent_Folders";

// const formattedData = [
//   {
//     fileName: "publish video - My Workspace 2024-11-07 18-58-20.mp4",
//     fileUrl: "https://example.com/files/video.mp4",
//     fileType: "video/mp4",
//     size: 3201883,
//     duration: 8,
//     createdAt: new Date(1737985345 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/video-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
//   {
//     fileName: "logo.png",
//     fileUrl: "https://example.com/files/logo.png",
//     fileType: "image/png",
//     size: 561556,
//     createdAt: new Date(1737985479 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/logo-thumb.jpg",
//   },
//   {
//     fileName: "benchmark api form.pdf",
//     fileUrl: "https://example.com/files/document.pdf",
//     fileType: "application/pdf",
//     size: 1569579,
//     createdAt: new Date(1737985546 * 1000),
//     thumbnailUrl: "https://example.com/thumbnails/document-thumb.jpg",
//   },
// ];

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file");
    const intent = formData.get("download");
    // console.log("formData", formData);
    if (intent) {
      console.log("formData", formData);
      const filePath = formData.get("filePath");
      const fileName = formData.get("fileName");
      const type = formData.get("type");
      const base64File = await convertFileToBase64(
        getDownloadableURL(filePath as string)
      );
      console.log("object of download", { base64File, type, fileName });
      // if (!searchQuery) {
      return { base64File, type, fileName };
    } else {
      if (!file || !(file instanceof globalThis.File)) {
        return new Response(
          JSON.stringify({ error: "No file uploaded or invalid file" }),
          { status: 400 }
        );
      }
      if (!user || !user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 400,
        });
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
  console.log("user", user);
  const files = await getFileByUserId(user?.id);
  console.log("files", files);
  const updateFiles = files.data
    ? await Promise.all(
        files?.data?.map(async (file: any) => {
          return {
            ...file,
            fileUrl: getDownloadableURL(file.filePath),
            filePath: file.filePath,
            ...(file.thumbnail && {
              thumbnail: getDownloadableURL(file.thumbnail),
            }),
          };
        })
      )
    : [];

  return { success: true, data: updateFiles };
}

// Helper function to convert a file URL into Base64
// async function convertFileToBase64(url: string): Promise<string> {
//   const response = await fetch(url);

//   // Ensure the response is valid
//   if (!response.ok) {
//     throw new Error(`Failed to fetch file from URL: ${url}`);
//   }

//   // Get the response as ArrayBuffer
//   const arrayBuffer = await response.arrayBuffer();

//   // Convert the ArrayBuffer to Base64
//   const base64String = Buffer.from(arrayBuffer).toString("base64");

//   return base64String;
// }

export default function Index() {
  const actionResult = useActionData<typeof action>();
  const { data, isLoading } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  console.log("useLoaderData inside index", data);
  // console.log("isLoading", isLoading);

  const isList = useIsListStore((state) => state.isList);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader className="animate-spin" size={40} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <ModeToggle />

      <DHeader
        pageName="My Drive"
        pathname={pathname}
        actionData={actionResult}
        isSearch
        btn={
          <Form
            method="post"
            id="upload-form"
            className="relative"
            encType="multipart/form-data"
          >
            {" "}
            <input
              placeholder="Upload"
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

      <UpgradeBanner />
      <Dash_Recent_Folders />
      <div
        className={`grid  gap-4 ${
          !isList
            ? "grid-cols-1"
            : " xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2"
        }`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {data?.map((file: FileType, idx: number) => (
            <File file={file} isList={isList} key={idx + file.id} />
          ))}
        </Suspense>
      </div>

      <pre>
        <code>{JSON.stringify(actionResult, null, 2)}</code>
      </pre>

      {actionResult && actionResult.success && (
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
      )}

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
