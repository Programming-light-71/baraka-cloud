import { LoaderFunctionArgs } from "@remix-run/node";
import { Buffer } from "buffer";
import { downloadTelegramFile } from "~/utils/backend-utils/downloadTelegramFile";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const [fileId, accessHash] = params.id?.split(":") || [];
  if (!fileId || !accessHash) throw new Error("Invalid file ID");

  try {
    const { base64, fileName, mimeType } = await downloadTelegramFile(
      fileId,
      accessHash
    );

    // Ensure base64 data has correct encoding
    const base64Data = base64.includes("base64,")
      ? base64.split("base64,")[1]
      : base64;

    const fileBuffer = Buffer.from(base64Data, "base64");

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("Download failed");
  }
};
