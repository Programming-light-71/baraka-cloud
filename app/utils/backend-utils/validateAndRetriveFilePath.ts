import { dbUpdateFile } from "./Queries/controllers/fIle.controller";

export async function RetrieveFilePathIfInvalid(
  id: string,
  fileId: string,
  filePath: string
): Promise<string | void> {
  try {
    const isValid = await fetch(filePath, { method: "HEAD" }).then(
      (res) => res.status !== 404
    );
    console.log("isValid", isValid);
    if (!isValid) {
      const url = `${process.env.SERVER_FILEM_URL}/getFile?file_id=${fileId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && data.result) {
        const newFilePath = data.result.file_path;
        await dbUpdateFile({ query: { id }, data: { filePath: newFilePath } });

        return newFilePath;
      }
    }

    return undefined;
  } catch (error) {
    console.error("Error processing file path:", error);
  }
}
