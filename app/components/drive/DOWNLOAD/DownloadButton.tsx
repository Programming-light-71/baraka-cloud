/* eslint-disable react-hooks/exhaustive-deps */
import { Download } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import toast from "react-hot-toast";

export function DownloadButton({
  filePath,
  fileName,
  type,
  btn,
  action,
}: {
  filePath: string;
  fileName: string;
  type: string;
  btn?: ReactNode | string;
  action?: string;
}) {
  interface FetcherData {
    type: string;
    base64File: string;
    fileName: string;
  }

  const fetcher = useFetcher<FetcherData>();

  useEffect(() => {
    if (fetcher.state === "submitting") {
      toast.loading("Downloading " + fileName);
    }

    if (fetcher.state === "idle" && fetcher.data) {
      toast.dismiss();
      if (fetcher.data.base64File) {
        toast.success("Download successful!");

        // Trigger file download
        const link = document.createElement("a");
        link.href = `data:${fetcher.data.type};base64,${fetcher.data.base64File}`;
        link.download = fetcher.data.fileName;
        link.click();
      } else {
        toast.error("Download failed!");
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <fetcher.Form method="post" action={action ?? "/drive?index"}>
        <input type="hidden" name="filePath" value={filePath} />
        <input type="hidden" name="fileName" value={fileName} />
        <input type="hidden" name="type" value={type} />

        {btn ? (
          btn
        ) : (
          <button
            type="submit"
            title="Download File"
            name="download"
            value="download"
          >
            <Download />
          </button>
        )}
      </fetcher.Form>
    </>
  );
}
