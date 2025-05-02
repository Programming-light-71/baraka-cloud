import { ReactNode } from "react";
import toast from "react-hot-toast";
import { downloadTelegramFile } from "~/utils/backend-utils/downloadTelegramFile"; // We'll define this

export function DownloadButton({
  id,
  fileId,
  fileReference,
  accessHash,
  fileName,
  type,
  btnText,
  dcId = 5, // optional
}: {
  id: string;
  fileId: string;
  fileReference: string; // JSON stringified version
  accessHash: string;
  fileName: string;
  type: string;
  btnText?: ReactNode | string;
  dcId?: number;
}) {
  console.log("DownloadButton Props:", {
    id,
    fileId,
    fileReference,
    accessHash,
    fileName,
    type,
    btnText,
    dcId,
  });
  const handleDownload = async () => {
    try {
      toast.loading(`Downloading ${fileName}...`);
      await downloadTelegramFile({
        fileId,
        accessHash,
        dcId,
        fileName,
        fileReference: JSON.parse(fileReference), // must be an object
      });

      toast.dismiss();
      toast.success("Download successful!");
    } catch (err) {
      toast.dismiss();
      toast.error("Download failed!");
      console.error(err);
    }
  };

  return (
    <button
      onClick={() => handleDownload}
      title="Download File"
      className="flex gap-2"
    >
      {btnText || "Download"}
    </button>
  );
}
