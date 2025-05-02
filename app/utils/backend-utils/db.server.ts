// init.ts or main.ts

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Logger } from "telegram/extensions/Logger";

Logger.setLevel("none");

// Fix __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionFilePath = path.join(__dirname, "session.json");

// Prisma setup
if (!globalThis.db) {
  globalThis.db = new PrismaClient();
  await globalThis.db.$connect();
}

// Telegram setup
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

    if (!globalThis.storeClient.connected) {
      throw new Error("Failed to connect to Telegram");
    }

    if (BOT_TOKEN && !SESSION_STRING) {
      await globalThis.storeClient.start({
        botAuthToken: BOT_TOKEN,
      });

      const newSession = globalThis.storeClient.session.save();
      fs.writeFileSync(sessionFilePath, newSession);
    }

    console.log("Telegram client initialized successfully");
  } catch (error) {
    console.error("Telegram client initialization failed:", error);
    throw error;
  }
}

export const db = globalThis.db;
export const storeClient = globalThis.storeClient;
