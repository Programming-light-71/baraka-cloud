// init.ts or main.ts

import { PrismaClient } from "@prisma/client";

// Prisma setup
if (!globalThis.db) {
  globalThis.db = new PrismaClient();
  await globalThis.db.$connect();
}

export const db = globalThis.db;
