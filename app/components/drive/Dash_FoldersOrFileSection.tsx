import type { ReactElement } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@remix-run/react";

const Dash_FoldersOrFileSection = ({
  secName,
  secBtn,
  secBtnNavigate,
  children,
}: {
  secName?: string;
  secBtn?: JSX.Element;
  secBtnNavigate?: string;
  children: ReactElement;
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>{secName || "Section Name"}</h1>
        {secBtn || (
          <Link to={secBtnNavigate || "#"} className="btn text-black ">
            View All
            <ChevronRight />
          </Link>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
};

export default Dash_FoldersOrFileSection;
