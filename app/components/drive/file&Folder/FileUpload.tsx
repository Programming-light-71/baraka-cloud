import { useFetcher } from "@remix-run/react";

import { CloudUpload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export function FileUpload() {
  const fetcher = useFetcher();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 300);
      return () => clearInterval(interval);
    }
    if (fetcher.state === "idle") {
      setProgress(0);
    }
  }, [fetcher.state]);

  return (
    <div className="space-y-2">
      <fetcher.Form
        method="post"
        action="/api/upload"
        encType="multipart/form-data"
        className="relative"
        id="upload-form"
      >
        <input
          title="Upload File"
          type="file"
          name="file"
          id="file"
          required
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              const form = document.getElementById(
                "upload-form"
              ) as HTMLFormElement;
              form?.requestSubmit();
            }
          }}
        />
        <Button
          className="bg-purple-700 text-white px-3 py-1 font-medium text-lg"
          type="button"
          onClick={() => document.getElementById("file")?.click()}
          disabled={fetcher.state === "submitting"}
        >
          <CloudUpload className="mr-2" />
          {fetcher.state === "submitting" ? "Uploading..." : "Upload"}
        </Button>
      </fetcher.Form>

      {fetcher.state === "submitting" && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {fetcher.data?.error && (
        <p className="text-sm text-red-500 mt-2">{fetcher.data.error}</p>
      )}

      {fetcher.data?.success && (
        <p className="text-sm text-green-500 mt-2">Upload successful!</p>
      )}
    </div>
  );
}
