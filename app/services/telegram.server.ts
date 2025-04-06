import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { PrismaClient } from "@prisma/client";

declare global {
  var telegramClient: TelegramClient; // Use 'let' for global properties
  var prisma: PrismaClient; // Use 'var' for global properties
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

if (!global.telegramClient) {
  const session = new StringSession(process.env.TELEGRAM_SESSION || "");

  global.telegramClient = new TelegramClient(
    session,
    Number(process.env.TELEGRAM_API_ID),
    process.env.TELEGRAM_API_HASH || "",
    {
      connectionRetries: 5,
      useWSS: true,
      baseLogger: console,
    }
  );

  await global.telegramClient.start({
    botAuthToken: process.env.TELEGRAM_BOT_TOKEN,
  });
}

export const telegram = global.telegramClient;
export { prisma };
