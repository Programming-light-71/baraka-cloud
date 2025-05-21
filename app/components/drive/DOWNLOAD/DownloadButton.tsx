import { ReactNode, useEffect, useCallback } from "react";

interface DownloadButtonProps {
  id: string;
  fileReference: string;
  accessHash: string;
  fileName: string;
  btnText?: ReactNode | string;
}

export function DownloadButton({
  id,
  fileReference,
  accessHash,
  fileName,
  btnText,
}: DownloadButtonProps) {
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(`/api/download/${id}:${accessHash}`);

      if (!response.ok) {
        console.error("Download failed");
        return;
      }

      const data = await response.json();
      const base64 = data.base64;
      const fileName = data.fileName;
      const mimeType = data.mimeType;

      const link = document.createElement("a");
      link.href = `data:${mimeType};base64,${base64}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, [id, accessHash, fileReference, fileName]);

  useEffect(() => {}, [
    handleDownload,
    id,
    accessHash,
    fileReference,
    fileName,
  ]);

  return (
    <button
      type="button"
      className="flex gap-2"
      title="Download File"
      onClick={handleDownload}
    >
      {btnText || "Download"}
    </button>
  );
}
