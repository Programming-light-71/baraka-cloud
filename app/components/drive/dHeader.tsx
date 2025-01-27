/* eslint-disable @typescript-eslint/no-explicit-any */
// app/routes/drive.tsx
import React from "react";
import { Search, Grid, ListCheck } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface DHeaderProps {
  isSearch?: boolean;
  pageName?: string;
  btn?: React.ReactNode | string;
  isGrid?: boolean;
  actionData?: any;
  pathname?: string;
}

// Action function for handling the POST request

const DHeader: React.FC<DHeaderProps> = ({
  isSearch,
  pageName,
  btn,
  isGrid = false,
  actionData,
  pathname,
}) => {
  console.log(actionData);

  console.log("state", pathname);
  const [grid, setGrid] = React.useState<React.ReactNode>(false);

  return (
    <div className="w-full space-y-4 px-4 py-4">
      {/* Search Bar */}
      {isSearch && (
        <div className="relative">
          <Search className="absolute top-1/2 h-full left-1 search-icon px-1 -translate-y-1/2 text-[#6672FB]" />
          <div className="absolute bg-[#3b73e22a] left-0 top-1/2 h-full w-8 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-10 bg-[#EFF3FB] text-[#757994] h-10 w-full md:w-3/4 xl:w-1/2 border-none"
          />
        </div>
      )}

      {/* Header and Upload Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize">
          {pageName || pathname}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setGrid(!grid)}
            variant="ghost"
            size="icon"
            className="h-13 w-13"
          >
            {!isGrid && !grid ? (
              <Grid className="h-13 w-13" />
            ) : (
              <ListCheck className="h-13 w-13" />
            )}
          </Button>

          {btn}
        </div>
      </div>
    </div>
  );
};

export default DHeader;
