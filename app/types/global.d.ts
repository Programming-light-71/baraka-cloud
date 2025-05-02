// global.d.ts

import { PrismaClient } from "@prisma/client";
import { TelegramClient } from "telegram";

declare global {
  interface GlobalThis {
    db: PrismaClient;
    storeClient: TelegramClient;
  }
}

export {}; // Ensure the file is treated as a module
