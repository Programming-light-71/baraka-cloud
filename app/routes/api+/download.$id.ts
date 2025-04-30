import { LoaderFunctionArgs } from "@remix-run/node";
import { downloadFile } from "~/services/download.server";
import { prisma } from "~/services/telegram.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const fileId = params.id;
  if (!fileId) throw new Response("Not found", { status: 404 });

  try {
    const { file, type, fileName } = await downloadFile(fileId);

    return new Response(
      JSON.stringify({
        type,
        file,
        fileName,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Download failed:", error);
    throw new Response("Download failed", { status: 500 });
  }
};
