import { useRef, useState } from "react";
import { Buffer } from "buffer";
import useCheckWrapped from "~/utils/frontend-utils/checkWrapped";
import { formatFileSize } from "~/utils/shared-utils/FileSizeFormatter";
import clsx from "clsx";
import type { File as FilesType } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";
import { File3Dot } from "../File3Dot/File3Dot";
import { DownloadButton } from "../DOWNLOAD/DownloadButton";

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
    fileReference,
  } = file;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  const isImage = type.startsWith("image");
  const isVideo = type.includes("video");
  const isDocument = type.includes("application");
  const fileIconText = type.split("/")[1];

  const dotMenu = <File3Dot btn={<EllipsisVertical />} dropDownsData={[]} />;

  useCheckWrapped(containerRef, setIsWrapped, 40);

  // Helper function to safely handle the base64 conversion
  const toBase64 = (input: string | Buffer | ArrayBuffer | Uint8Array) => {
    if (input instanceof Buffer) {
      return input.toString("base64");
    }
    if (input instanceof Uint8Array) {
      return Buffer.from(input).toString("base64");
    }
    if (typeof input === "string") {
      return Buffer.from(input).toString("base64");
    }
    return ""; // Return an empty string if the input type is invalid
  };

  const getThumbnailSrc = () => {
    // Only render the image if it's a valid image or we have a valid thumbnail
    if (
      (isList || isWrapped) &&
      ((type?.startsWith("image") && !type?.includes("svg")) || thumbnail)
    ) {
      return thumbnail
        ? `data:${type};base64,${toBase64(thumbnail)}`
        : "/logo-dark.svg";
    }
    return undefined;
  };

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
          {getThumbnailSrc() ? (
            <img
              src={getThumbnailSrc()}
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

      <div className="absolute right-0 bottom-2 group-hover:opacity-100 opacity-0 transition-all duration-150 flex items-center">
        <DownloadButton
          id={id}
          fileReference={
            fileReference
              ? typeof fileReference === "string"
                ? fileReference
                : Buffer.from(fileReference).toString("base64")
              : ""
          }
          accessHash={accessHash}
          fileName={name}
        />
        {dotMenu}
      </div>
    </div>
  );
};

export default File;
