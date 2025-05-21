import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

// Components
import DHeader from "~/components/drive/dHeader";
import { ModeToggle } from "~/components/theme/ToggleMode";
import UpgradeBanner from "~/components/drive/index/upgradeBanner";
import Dash_Recent_Folders from "~/components/drive/index/Dash_Recent_Folders";
import Dash_Pined_Folders from "~/components/drive/index/Dash_Pined_FilesOrFolders";
import Dash_Recent_Files from "~/components/drive/index/Dash_Recent_Files";
// import { FileUpload } from "~/components/drive/file&Folder/FileUpload";

// Utils
import { requireAuth } from "~/utils/backend-utils/AuthProtector";
import {
  fileUploader,
  getFilesByUserId,
} from "~/utils/backend-utils/Queries/controllers/fIle.controller";
import { getFile } from "~/utils/backend-utils/Queries/controllersHelper/getFile";
import { useDisappearUpgradeBanner } from "~/local_store+state/Drive/useDisappearUpgradeBanner";
import { FileUpload } from "~/components/drive/file&Folder/FileUpload";
import { telegram } from "~/services/telegram.server";
import { PassThrough } from "stream";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get("download");

    if (intent === "true") {
      const id = formData.get("fileId") as string;
      const accessHash = formData.get("accessHash") as string;
      const fileReferenceBase64 = formData.get("fileReference") as string;
      const fileName = formData.get("fileName") as string;

      if (!fileReferenceBase64) {
        console.error("fileReferenceBase64 is undefined");
        return new Response("fileReferenceBase64 is undefined", {
          status: 400,
        });
      }

      const fileId = BigInt(id) as any;
      const fileReference = Buffer.from(fileReferenceBase64, "base64");

      const client = telegram;
      console.log("object", { id, accessHash, fileReference, client });
      const inputDocument = {
        id: fileId,
        accessHash: BigInt(accessHash),
        fileReference,
      } as any;

      const stream = new PassThrough();

      await (telegram as any).downloadMedia(inputDocument, {
        file: stream,
      });

      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);
      const base64 = fileBuffer.toString("base64");

      return new Response(
        JSON.stringify({
          base64,
          fileName,
          mimeType: "application/octet-stream",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const file = formData.get("file");

    // ✅ Move this block inside the try
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
      return new Response(JSON.stringify(uploadedData), { status: 400 });
    }

    return new Response(JSON.stringify(uploadedData), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
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
  if (!user?.id) return Response.redirect("/login");
  const files = await getFilesByUserId(user.id, 5, 0);
  return { success: true, data: files };
}

export default function Index() {
  const actionResult = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const { isAppearUpgradeBanner, checkAndResetBanner } =
    useDisappearUpgradeBanner();

  useEffect(() => {
    if (actionResult) {
      toast.success(
        <pre>
          <code>{JSON.stringify(actionResult, null, 2)}</code>
        </pre>
      );
    }
  }, [actionResult]);

  useEffect(() => {
    checkAndResetBanner();
    return () => checkAndResetBanner();
  }, [checkAndResetBanner]);

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
      <Dash_Recent_Files data={loaderData?.data ?? []} />

      <button
        onClick={() => alert("Trash button clicked")}
        type="button"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Trash
      </button>
    </div>
  );
}
