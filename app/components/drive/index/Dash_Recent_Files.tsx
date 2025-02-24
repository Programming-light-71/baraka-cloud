import type { File as FileType } from "@prisma/client";
import { useIsListStore } from "~/local_store+state/listToggle";
import Dash_FoldersOrFileSection from "../Dash_FoldersOrFileSection";
import { Suspense } from "react";
import File from "../file&Folder/file";

const Dash_Recent_Files = ({
  data = [],
  secName = "Recent Files",
  secBtnName,
}: {
  data: FileType[];
  secName?: string;
  secBtnName?: string;
}) => {
  const isList = useIsListStore((state) => state.isList);
  return (
    <div className="w-full my-5">
      <Dash_FoldersOrFileSection
        secName={secName}
        secBtnNavigate="/drive/my-drive"
        secBtnName={secBtnName}
      >
        <div
          className={`grid  gap-4 ${
            !isList
              ? "grid-cols-1"
              : " xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2"
          }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            {data?.map((file: FileType, idx: number) => (
              <File file={file} isList={isList} key={idx + file.id} />
            ))}
          </Suspense>
        </div>
      </Dash_FoldersOrFileSection>
    </div>
  );
};

export default Dash_Recent_Files;
