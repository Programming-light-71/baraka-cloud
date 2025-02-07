// @flow

// import type { Folder as FolderType } from "@prisma/client";
import { Link } from "@remix-run/react";
import {
  EllipsisVertical,
  FolderClock,
  FolderClosed,
  Folder as FolderIcon,
} from "lucide-react";

interface FolderProps {
  files?: number;
  name?: string;
  createdAt?: Date;
}

type Props = {
  icon?: string;
  folder: FolderProps;
  fn?: () => void;
  color?: string;
  cusFName?: string;
  navigate?: string;
};
export const Folder = ({
  icon,
  folder,
  cusFName,
  fn,
  color,
  navigate,
}: Props) => {
  return (
    <div
      // to={navigate || "#"}

      className={` p-5 rounded-lg  max-w-52 ${
        color ? color : "bg-yellow text-white"
      }`}
    >
      <div className="flex items-center gap-2 justify-between text-2xl">
        {icon || <FolderClosed />}

        <EllipsisVertical />
      </div>

      <Link
        to={navigate || "#"}
        type="button"
        onClick={fn}
        className="flex text-xl mt-1  font-semibold mb-5"
      >
        {cusFName || folder?.name || "Folder Name"}
      </Link>

      <p className="flex items-center text-xs gap-2">
        <FolderIcon size={12} /> {folder?.files || 0} Files
      </p>
      <p className="flex items-center text-xs gap-2">
        <FolderClock size={12} className="text-sm" />{" "}
        {new Date(folder?.createdAt as Date).toDateString()}
      </p>
    </div>
  );
};
