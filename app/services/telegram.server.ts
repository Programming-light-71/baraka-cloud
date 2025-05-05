import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { PrismaClient } from "@prisma/client";

declare global {
  var telegramClient: TelegramClient;
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

if (!global.telegramClient) {
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

  global.telegramClient = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
    baseLogger: console,
  });

  // Initialize the client
  try {
    await global.telegramClient.start({
      botAuthToken: botToken,
    });
    console.log("✅ Telegram client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Telegram client:", error);
    throw error;
  }
}

export const telegram = global.telegramClient;
export { prisma };
