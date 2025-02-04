import { useEffect } from "react";
import { useActionData } from "@remix-run/react";

interface ActionData {
  fileName: string;
  base64File: string;
  type: string;
}

export function FileDownload() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData && actionData.base64File) {
      const link = document.createElement("a");
      link.href = `data:${actionData.type};base64,${actionData.base64File}`;
      link.download = actionData.fileName; // Set the file name for download
      link.click();
    }
  }, [actionData]);

  return <div>Downloading your file...</div>;
}
