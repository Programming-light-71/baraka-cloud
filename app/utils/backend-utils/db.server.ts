import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import type { NewMessageEvent } from "telegram/events";

// Initialize Prisma client
let db: PrismaClient;
if (!globalThis.db) {
  globalThis.db = new PrismaClient();
  await globalThis.db.$connect();
}
db = globalThis.db;

// Fix __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionFilePath = path.join(__dirname, "session.json");

// Telegram client initialization
let storeClient: TelegramClient;

if (!globalThis.storeClient) {
  const APP_ID = parseInt(process.env.Tel_APP_ID || "");
  const APP_HASH = process.env.Tel_APP_HASH || "";
  const BOT_TOKEN = process.env.Tel_BOT_TOKEN || "";
  const SESSION_STRING = process.env.TELEGRAM_SESSION || "";

  if (!APP_ID || !APP_HASH) {
    throw new Error("Missing Telegram API credentials");
  }

  const session = new StringSession(SESSION_STRING);

  globalThis.storeClient = new TelegramClient(session, APP_ID, APP_HASH, {
    connectionRetries: 5,
    useWSS: true,
    autoReconnect: true,
  });

  try {
    await globalThis.storeClient.connect();

    // Verify connection
    if (!globalThis.storeClient.connected) {
      throw new Error("Failed to connect to Telegram");
    }

    // If using bot token
    if (BOT_TOKEN && !SESSION_STRING) {
      await globalThis.storeClient.start({
        botAuthToken: BOT_TOKEN,
      });
      // Save new session
      const newSession = globalThis.storeClient.session.save();
      fs.writeFileSync(sessionFilePath, newSession);
    }

    console.log("Telegram client initialized successfully");
  } catch (error) {
    console.error("Telegram client initialization failed:", error);
    throw error;
  }
}

storeClient = globalThis.storeClient;

export { db, storeClient };
