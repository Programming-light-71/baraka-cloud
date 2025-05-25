import { ReactNode, useCallback } from "react";
import { useFileTransfer } from "~/contexts/FileTransferContext";

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
  const { addTransfer, updateTransfer, removeTransfer } = useFileTransfer();

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/download/${id}?accessHash=${accessHash}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        addTransfer({
          fileName,
          progress: 0,
          bytesTransferred: 0,
          totalBytes: 0,
          status: "error",
        });
        console.error("Download failed");
        return;
      }

      const contentLength = response.headers.get("Content-Length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const downloadFileName = contentDisposition
        ? decodeURIComponent(
            contentDisposition.split('filename="')[1].split('"')[0]
          )
        : fileName;

      // Initialize transfer in the global context
      addTransfer({
        fileName: downloadFileName,
        progress: 0,
        bytesTransferred: 0,
        totalBytes,
        status: "downloading",
      });

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) {
        updateTransfer(downloadFileName, { status: "error" });
        throw new Error("Failed to get stream reader");
      }

      let downloadedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        downloadedBytes += value.length;

        const progress = totalBytes
          ? Math.round((downloadedBytes / totalBytes) * 100)
          : 0;

        updateTransfer(downloadFileName, {
          progress,
          bytesTransferred: downloadedBytes,
          status: "downloading",
        });
      }

      // Combine chunks and create blob
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      updateTransfer(downloadFileName, {
        status: "completed",
        progress: 100,
      });

      // Remove the completed transfer after a delay
      setTimeout(() => {
        removeTransfer(downloadFileName);
      }, 3000);
    } catch (error) {
      console.error("Download failed:", error);
      updateTransfer(fileName, { status: "error" });
    }
  }, [id, accessHash, fileName, addTransfer, updateTransfer, removeTransfer]);

  return (
    <button
      type="button"
      className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
      title="Download File"
      onClick={handleDownload}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
        />
      </svg>
      {btnText || "Download"}
    </button>
  );
}
