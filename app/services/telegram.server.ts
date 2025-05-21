import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const sessionString = process.env.TELEGRAM_SESSION;

if (!apiId || !apiHash || !botToken) {
  throw new Error(
    "Missing required Telegram credentials. Please ensure TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_BOT_TOKEN are set in environment variables"
  );
}

const session = new StringSession(sessionString || "");

const telegramClient = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
  useWSS: true,
  baseLogger: undefined,
});

// Initialize the client
try {
  await telegramClient.start({
    botAuthToken: botToken,
  });
  console.log("✅ Telegram client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Telegram client:", error);
  throw error;
}

import { Api } from "telegram";
import fs from "fs/promises";

export const telegram = telegramClient;
export { prisma, Api };

export async function uploadTheme(filePath: string) {
  try {
    const fileData = await fs.readFile(filePath);

    const result = await telegram.invoke(
      new Api.account.UploadTheme({
        file: new Api.InputFile({
          name: "theme.tgtheme",
          mtime: 0,
          bytes: fileData,
        }),
        format: "android",
      })
    );

    console.log("Theme upload result:", result);
    return result;
  } catch (error) {
    console.error("Error uploading theme:", error);
    throw error;
  }
}

export async function uploadFile(
  fileData: Buffer,
  fileName: string,
  userId: number
) {
  try {
    const result = await telegram.sendDocument(
      userId,
      new Api.InputMediaUploadedDocument({
        file: new Api.InputFile({
          name: fileName,
          mtime: 0,
          bytes: fileData,
        }),
        mimeType: "application/octet-stream",
        attributes: [
          new Api.DocumentAttributeFilename({
            fileName: fileName,
          }),
        ],
      })
    );

    console.log("File upload result:", result);
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
