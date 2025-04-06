export function FileDownload({
  fileId,
  fileName,
}: {
  fileId: string;
  fileName: string;
}) {
  return (
    <a
      href={`/api/download/${fileId}`}
      download={fileName}
      className="text-blue-500 hover:underline"
    >
      Download {fileName}
    </a>
  );
}
