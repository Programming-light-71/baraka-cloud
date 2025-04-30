// @flow

// import type { Folder as FolderType } from "@prisma/client";
import { Link } from "@remix-run/react";
import {
  EllipsisVertical,
  FolderClock,
  FolderClosed,
  Folder as FolderIcon,
} from "lucide-react";
import { useIsListStore } from "~/local_store+state/listToggle";

interface FolderProps {
  files?: number;
  name?: string;
  createdAt?: Date;
}

type Props = {
  icon?: JSX.Element;
  textColor?: string;
  folder?: FolderProps;
  fn?: () => void;
  color?: string;
  cusFName?: string;
  navigate?: string;
};
export const Folder = ({
  icon,
  textColor = "dark:text-white text-black",
  folder,
  cusFName,
  fn,
  color,
  navigate,
}: Props) => {
  const isList = useIsListStore((state) => state.isList);
  const name =
    (cusFName || folder?.name || "Folder Name").slice(0, 15) +
    (((cusFName as string) || (folder?.name as string))?.length > 15
      ? "..."
      : "");
  return (
    <Link
      to={navigate || "#"}
      key={folder?.name}
      className={`cursor-default relative z-0 ${
        !isList ? "w-full" : "min-w-[240px] "
      }`}
      type="button"
      onClick={fn}
    >
      <div
        // to={navigate || "#"}

        className={` p-5 rounded-lg  w-full min-w-[240px] duration-150 transition-all ${textColor}  ${
          color ? color : "bg-yellow/90   hover:bg-yellow/80"
        } ${!isList ? " flex justify-between w-full items-center" : ""}`}
      >
        <div className="flex items-center gap-2 justify-between ">
          <span
            className={` p-1 rounded-md    ${
              color ? color : "bg-yellow/90   hover:bg-yellow/80"
            }`}
          >
            {icon || <FolderClosed />}
          </span>

          {isList ? (
            <EllipsisVertical
              size={30}
              className="cursor-pointer p-2 hover:bg-slate-100/30 rounded-full relative z-50"
              onClick={(e) => e.preventDefault()} // Prevent navigation
            />
          ) : (
            <p className="flex text-base font-semibold ">{name}</p>
          )}
        </div>

        {isList && (
          <p className="flex text-xl   font-semibold mb-5 mt-1">{name}</p>
        )}

        {folder?.files && (
          <p className="flex items-center text-xs gap-2">
            <FolderIcon size={isList ? 12 : 16} /> {folder?.files || 0} Files
          </p>
        )}
        {folder?.createdAt && (
          <p className={`flex items-center  gap-2 ${isList && "text-xs"}`}>
            <FolderClock size={isList ? 12 : 16} />{" "}
            {new Date(folder?.createdAt as Date).toDateString()}
          </p>
        )}

        {!isList && (
          <EllipsisVertical
            size={30}
            className="cursor-pointer p-2 hover:bg-slate-100/30 rounded-full relative z-50"
            onClick={(e) => e.preventDefault()} // Prevent navigation
          />
        )}
      </div>
    </Link>
  );
};
