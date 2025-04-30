import { ReactNode, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import toast from "react-hot-toast";

export function DownloadButton({
  id,
  fileId,
  fileReference,
  accessHash,
  fileName,
  type,
  btnText,
}: {
  id: string;
  fileId: string;
  fileReference: string;
  accessHash: string;
  fileName: string;
  type: string;
  btnText?: ReactNode | string;
}) {
  interface FetcherData {
    type: string;
    file: string;
    fileName: string;
  }

  const fetcher = useFetcher<FetcherData>();

  useEffect(() => {
    if (fetcher.state === "submitting") {
      toast.loading("Downloading " + fileName);
    }

    if (fetcher.state === "idle" && fetcher.data) {
      toast.dismiss();
      if (fetcher.data.file) {
        toast.success("Download successful!");

        // Trigger file download
        const link = document.createElement("a");
        link.href = `data:${fetcher.data.type};base64,${fetcher.data.file}`;
        link.download = fetcher.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Download failed!");
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form method="get" action={`/api/download/${fileId}`}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="fileReference" value={fileReference} />
      <input type="hidden" name="accessHash" value={accessHash} />
      <button type="submit" title="Download File" className="flex gap-2">
        {btnText || "Download"}
      </button>
    </fetcher.Form>
  );
}
