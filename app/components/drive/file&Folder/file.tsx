import { useRef, useState } from "react";
import useCheckWrapped from "~/utils/frontend-utils/checkWrapped";
import { formatFileSize } from "~/utils/shared-utils/FileSizeFormatter";
import clsx from "clsx";

import type { File } from "@prisma/client";

import { DownloadButton } from "../DOWNLOAD/DownloadButton";

interface FileDetails extends File {
  fileUrl?: string;
}

interface FileProps {
  file: FileDetails;
  isList?: boolean;
}

const File = ({ file, isList }: FileProps) => {
  const {
    name,
    type,
    size,
    createdAt,
    filePath,
    fileUrl,
    thumbnail,
    // duration,
    // isStarred,
    // isShared,
  } = file;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  const isImage = type.startsWith("image");
  const isVideo = type.includes("video");
  const isDocument = type.includes("application");
  const fileIconText = type.split("/")[1];

  // Wrapped observer
  useCheckWrapped(containerRef, setIsWrapped, 40);

  return (
    <div
      className={clsx(
        "w-full relative h-auto transition-all duration-150 bg-[#F7F7F7] dark:bg-[#fffffffa]/15 p-2 group dark:text-white hover:bg-[#6672FB] dark:hover:bg-[#6672FB] dark:hover:text-white hover:text-white flex items-center justify-between rounded-md flex-wrap gap-3 ",
        !isList && "md:pr-3  md:flex-nowrap"
      )}
    >
      {/* File Icon / Thumbnail */}
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
          {isList || isWrapped ? (
            (type?.startsWith("image") && !type?.includes("svg")) ||
            thumbnail ? (
              <img
                src={thumbnail || fileUrl}
                alt="Thumbnail"
                className="h-full w-full object-cover  "
                height={100}
                width={100}
              />
            ) : (
              <span className=" h-full w-full object-cover flex items-center justify-center font-semibold text-black">
                {fileIconText}
              </span>
            )
          ) : (
            <span className="text-sm font-semibold text-black">
              {fileIconText}
            </span>
          )}
        </div>

        {/* File Details */}
        <div className="flex flex-col">
          <p className="font-medium truncate max-w-[200px]">{name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-200">
            {formatFileSize(size as number)}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-gray-300">
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Download Button */}
      {/* <a
        title={name}
        href={filePath}
        type="download"
        download={"baraka-cloud" + name}
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        <Download size={20} />
      </a> */}

      {/* <a
        href={`data:${type};base64,${filePath}`}
        download={name}
        className="text-blue-600 underline"
      >
        Download File
      </a> */}

      <DownloadButton filePath={filePath} fileName={name} type={type} />
      {/* <FileDownload /> */}
      {/* <button
        onClick={() => handleDownloadFile(filePath, name)}
        type="button"
        title="sd"
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        <Download size={20} />
      </button> */}
    </div>
  );
};

export default File;
