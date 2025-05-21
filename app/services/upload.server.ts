import { telegram, prisma } from "./telegram.server";
import { Buffer } from "buffer";
import { Api } from "telegram";

export async function uploadFile(file: File, userId: string) {
  try {
    console.log(`Starting upload: ${file.name} (${file.size} bytes)`);

    // 3. Upload file to Telegram
    const uploadedFile = await telegram.uploadFile({
      file: file,
      workers: 4,
      onProgress: (progress) => {
        console.log(`Upload progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log("Telegram upload complete, sending media message...");

    // 4. Send as media message
    const result = await telegram.invoke(
      new Api.messages.SendMedia({
        peer: process.env.TELEGRAM_STORAGE_CHAT_ID,
        media: new Api.InputMediaUploadedDocument({
          file: uploadedFile,
          mimeType: file.type,
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: file.name }),
          ],
          forceFile: true,
        }),
        message: `Uploaded ${file.name}`,
        randomId: BigInt(Math.floor(Math.random() * 1e18)),
      })
    );

    // 5. Process result
    const message = result.updates.find(
      (u: any) => u.className === "UpdateNewChannelMessage"
    )?.message;

    if (!message?.media?.document) {
      throw new Error("No document found in message result");
    }

    const doc = message.media.document;

    // 6. Save to database
    return await prisma.file.create({
      data: {
        userId,
        name: file.name,
        type: file.type,
        size: file.size,
        fileId: doc.id.toString(),
        accessHash: doc.accessHash.toString(),
        dcId: doc.dcId,
        fileReference: Buffer.from(String(doc.fileReference)),
        messageId: message.id.toString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error(
      process.env.NODE_ENV === "development"
        ? `Upload error: ${error.message}`
        : "File upload failed. Please try again."
    );
  }
}
