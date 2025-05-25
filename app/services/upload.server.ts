import { telegram, prisma } from "./telegram.server";
import { Buffer } from "buffer";
import { Api } from "telegram";
import bigInt from "big-integer";

interface UploadResult {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
}

export async function uploadFile(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    console.log(`Starting upload: ${file.name} (${file.size} bytes)`);

    // 1. Upload file to Telegram
    const uploadedFile = await telegram.uploadFile({
      file: file,
      workers: 4, // Parallel upload chunks
      onProgress: (progress) => {
        console.log(`Upload progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log("Telegram upload complete, sending media message...");

    // 2. Send as media message with proper attributes
    const result = await telegram.invoke(
      new Api.messages.SendMedia({
        peer: process.env.TELEGRAM_STORAGE_CHAT_ID,
        media: new Api.InputMediaUploadedDocument({
          file: uploadedFile,
          mimeType: file.type || "application/octet-stream",
          attributes: [
            new Api.DocumentAttributeFilename({ fileName: file.name }),
          ],
          forceFile: true, // Ensure it's saved as a file, not optimized media
        }),
        message: `Uploaded ${file.name}`,
        randomId: bigInt(Math.floor(Math.random() * 1e6).toString()),
      })
    );

    if (!(result instanceof Api.Updates)) {
      throw new Error("Invalid response type from Telegram");
    }

    // 3. Process result - find the message containing our upload
    const updates = result.updates;
    if (!Array.isArray(updates) || !updates.length) {
      throw new Error("No updates received from Telegram");
    }

    const updateMessage = updates.find((update) => {
      if (
        update instanceof Api.UpdateNewChannelMessage ||
        update instanceof Api.UpdateNewMessage
      ) {
        return true;
      }
      return false;
    });

    if (!updateMessage || !("message" in updateMessage)) {
      throw new Error("No message found in upload result");
    }

    const message = updateMessage.message;
    if (!(message instanceof Api.Message)) {
      throw new Error("Invalid message type in upload result");
    }

    if (
      !message.media ||
      !(message.media instanceof Api.MessageMediaDocument)
    ) {
      throw new Error("No document found in message result");
    }

    const doc = message.media.document;
    if (!(doc instanceof Api.Document)) {
      throw new Error("Invalid document type in message");
    }

    const peerId = message.peerId;
    if (!peerId) {
      throw new Error("No peer ID found in message");
    }

    if (!doc.id || !doc.accessHash || !doc.fileReference) {
      throw new Error("Missing required document properties");
    }

    // Get chat ID based on peer type
    let chatId = "";
    if (peerId instanceof Api.PeerChannel) {
      chatId = peerId.channelId.toString();
    } else if (peerId instanceof Api.PeerChat) {
      chatId = peerId.chatId.toString();
    } else if (peerId instanceof Api.PeerUser) {
      chatId = peerId.userId.toString();
    }

    if (!chatId) {
      throw new Error("Could not determine chat ID");
    }

    // 4. Save to database with ALL required fields
    const dbResult = await prisma.file.create({
      data: {
        userId,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        // Telegram file identifiers
        fileId: doc.id.toString(),
        accessHash: doc.accessHash.toString(),
        dcId: doc.dcId,
        fileReference: Buffer.from(doc.fileReference), // Store as Buffer
        // Message context for refreshes
        messageId: message.id.toString(),
        chatId,
        // Timestamps
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        createdAt: true,
      },
    });

    console.log(`Upload complete: ${dbResult.name}`);
    return dbResult;
  } catch (error: unknown) {
    console.error("Upload failed:", error);

    // Provide detailed error in development, generic in production
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Upload error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        : "File upload failed. Please try again.";

    throw new Error(errorMessage);
  }
}
