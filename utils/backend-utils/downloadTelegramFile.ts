import { Api, TelegramClient } from "gramjs";
import { Buffer } from "buffer";
import { ConvertIntoBase64Formate } from "../shared-utils/ConvertIntoBase64Formate";
import { ensureDir, writeFile } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";

interface DownloadResult {
  base64: string;
  fileName: string;
  mimeType: string;
}

export async function downloadTelegramFile(
  fileId: string,
  accessHash: string
): Promise<DownloadResult> {
  const client = new TelegramClient(
    process.env.TELEGRAM_SESSION!,
    Number(process.env.TELEGRAM_API_ID!),
    process.env.TELEGRAM_API_HASH!,
    { connectionRetries: 5 }
  );

  await client.connect();

  try {
    const inputFile = new Api.InputDocumentFileLocation({
      id: BigInt(fileId),
      accessHash: BigInt(accessHash),
      fileReference: Buffer.from(""),
      thumbSize: "",
    });

    // Accumulate full file
    let fileBuffer = Buffer.alloc(0);
    for await (const chunk of client.iterDownload(inputFile)) {
      fileBuffer = Buffer.concat([fileBuffer, chunk]);
    }

    // First get valid file reference
    const fileRefResult = await client.invoke(
      new Api.upload.GetFile({
        location: inputFile,
        offset: 0,
        limit: 1,
      })
    );
    
    const fileReference = fileRefResult.fileReference;
    
    // Use valid file reference for full file download
    const inputFileWithRef = new Api.InputDocumentFileLocation({
      id: BigInt(fileId),
      accessHash: BigInt(accessHash),
      fileReference: fileReference,
      thumbSize: "",
    });
    
    // Create temporary download path
    const tempDir = await tmpdir();
    const tempFilePath = join(tempDir, `telegram_download_${Date.now()}`);
    
    // Download to temp file
    await client.downloadToFile(inputFileWithRef, tempFilePath);
    
    // Read the temp file
    const fileBuffer = await fs.promises.readFile(tempFilePath);
    
    // Cleanup
    await fs.promises.unlink(tempFilePath);

    // Convert to base64
    const base64Data = ConvertIntoBase64Formate(fileBuffer, file.mimeType);
    
    return {
      base64: base64Data,
      fileName: file.name || `file_${Date.now()}`,
      mimeType: file.mimeType,
    };
  } finally {
    await client.disconnect();
  }
}
