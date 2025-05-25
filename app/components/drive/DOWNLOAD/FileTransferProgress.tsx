import React from "react";

export interface TransferProgress {
  fileName: string;
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  status: "downloading" | "uploading" | "completed" | "error";
}

interface FileTransferProgressProps {
  transfers: TransferProgress[];
}

export function FileTransferProgress({ transfers }: FileTransferProgressProps) {
  if (transfers.length === 0) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">File Transfers</h3>
        <span className="text-xs text-gray-500">
          {transfers.length} {transfers.length === 1 ? "transfer" : "transfers"}
        </span>
      </div>

      <div className="space-y-3">
        {transfers.map((transfer, index) => (
          <div
            key={`${transfer.fileName}-${index}`}
            className="bg-gray-50 dark:bg-gray-700 rounded p-3"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-4">
                <div
                  className="text-sm font-medium truncate"
                  title={transfer.fileName}
                >
                  {transfer.fileName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatBytes(transfer.bytesTransferred)} of{" "}
                  {formatBytes(transfer.totalBytes)}
                </div>
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {transfer.status === "downloading" && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {transfer.status === "uploading" && (
                  <svg
                    className="animate-spin h-4 w-4 text-purple-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {transfer.status === "completed" && (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
                {transfer.status === "error" && (
                  <svg
                    className="h-4 w-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                <div
                  style={{ width: `${transfer.progress}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
                    transfer.status === "downloading"
                      ? "bg-blue-500"
                      : transfer.status === "uploading"
                      ? "bg-purple-500"
                      : transfer.status === "completed"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                  {transfer.progress}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
