import { useRef, useState } from "react";
import useCheckWrapped from "~/utils/frontend-utils/checkWrapped";
import { formatFileSize } from "~/utils/shared-utils/FileSizeFormatter";
import clsx from "clsx";

import type { File as FilesType } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";
import toast from "react-hot-toast";
import { File3Dot } from "../File3Dot/File3Dot";
// import { DownloadButton } from "../DOWNLOAD/DownloadButton";

interface FileProps {
  file: FilesType;
  isList?: boolean;
}

const File = ({ file, isList }: FileProps) => {
  const {
    id,
    name,
    type,
    size,
    createdAt,
    thumbnail,
    accessHash,
    dcId,
    fileId,
    fileReference,
  } = file;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  const isImage = type.startsWith("image");
  const isVideo = type.includes("video");
  const isDocument = type.includes("application");
  const fileIconText = type.split("/")[1];
  const dotMenu = (
    <File3Dot
      btn={<EllipsisVertical />}
      dropDownsData={[
        <div key={fileId} className="flex items-center gap-2">
          {/* <DownloadButton
            id={id}
            btnText="Download"
            fileId={fileId}
            fileReference={JSON.stringify(fileReference)} // 🔁 MUST be stringified
            accessHash={accessHash}
            fileName={name}
            type={type}
          /> */}
          <button
            onClick={async () => {
              toast.loading(`Downloading ${name}...`);
              // Call your download function here
              // ------------------------

              const referenceBuffer = Buffer.from(Object.values(fileReference));
              const base64Ref = referenceBuffer.toString("base64");

              const downloadUrl = `/api/downloadFile?fileId=${fileId}&accessHash=${accessHash}&dcId=${dcId}&fileName=${name}&fileReference=${base64Ref}`;

              try {
                const response = await fetch(downloadUrl);

                if (!response.ok) {
                  throw new Error("Download failed");
                }

                const blob = await response.blob();

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url); // Clean up
              } catch (err) {
                console.error("Error downloading file:", err);
              }

              // --------------------------

              toast.dismiss();
              toast.success("Download successful!");
            }}
            className="flex gap-2"
            title="Download File"
          >
            <span className="text-sm">Download</span>
            <img
              src="/logo-dark.svg"
              alt="Download"
              className="h-4 w-4 object-cover"
              height={16}
              width={16}
            />
          </button>
        </div>,
      ]}
    />
  );

  useCheckWrapped(containerRef, setIsWrapped, 40);

  return (
    <div
      className={clsx(
        "w-full relative h-auto transition-all duration-150 bg-[#F7F7F7] dark:bg-[#fffffffa]/15 p-2 group dark:text-white hover:bg-[#6672FB] dark:hover:bg-[#6672FB] dark:hover:text-white hover:text-white flex items-center justify-between rounded-md flex-wrap gap-3",
        !isList && "md:pr-3 md:flex-nowrap"
      )}
    >
      <div
        ref={containerRef}
        className="flex gap-3 items-center flex-wrap w-full"
      >
        <div
          className={clsx(
            "flex items-center justify-center rounded-md overflow-hidden",
            isList ? "w-full h-28" : "md:w-12 md:h-12",
            isImage
              ? "bg-blue-300"
              : isVideo
              ? "bg-green-300"
              : isDocument
              ? "bg-red-300"
              : "bg-gray-300"
          )}
        >
          {(isList || isWrapped) &&
          ((type?.startsWith("image") && !type?.includes("svg")) ||
            thumbnail) ? (
            <img
              src={`data:${type};base64,${thumbnail}` || "/logo-dark.svg"}
              alt="Thumbnail"
              className="h-full w-full object-cover"
              height={100}
              width={100}
            />
          ) : (
            <span className="text-sm font-semibold text-black">
              {fileIconText}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="font-medium truncate max-w-[200px]">{name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-200">
            {formatFileSize(Number(size))}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-gray-300">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="absolute right-0 bottom-2 group-hover:opacity-100 opacity-0 transition-all duration-150">
        {dotMenu}
      </div>
    </div>
  );
};

export default File;
