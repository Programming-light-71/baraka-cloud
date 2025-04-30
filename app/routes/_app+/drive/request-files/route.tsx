/* eslint-disable @typescript-eslint/no-explicit-any */
// import { File as FileType } from "@prisma/client";
// import { Check, FileText, MoreVertical, X } from "lucide-react";
import { Suspense } from "react";
import File from "~/components/drive/file&Folder/file";
import { useIsListStore } from "~/local_store+state/listToggle";

interface FileRequest {
  id: string;
  name: string;
  author: string;
  date: string;
  size: string;
  icon: "pdf" | "doc" | "zip";
  selected?: boolean;
}

const fileRequests: FileRequest[] = [
  {
    id: "1",
    name: "Design Thinking Process",
    author: "Jhan",
    date: "Dec 13, 2019",
    size: "2 MB",
    icon: "pdf",
  },
  {
    id: "2",
    name: "Design Thinking Process",
    author: "Emad",
    date: "Nov 04, 2019",
    size: "10 MB",
    icon: "doc",
    selected: true,
  },
  {
    id: "3",
    name: "Characters Animation",
    author: "Mahmud",
    date: "Nov 01, 2019",
    size: "50 MB",
    icon: "zip",
  },
];

export default function RequestedFiles() {
  const isList = useIsListStore((state) => state.isList);
  return (
    <div
      className={`grid  gap-4 ${
        !isList
          ? "grid-cols-1"
          : " xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2"
      }`}
    >
      {/* <Suspense fallback={<div>Loading...</div>}>
        {fileRequests?.map((file: any, idx: number) => (
          <File file={file} isList={isList} key={idx + file.id} />
        ))}
      </Suspense> */}
    </div>
  );
}
