import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (!db) {
  db = new PrismaClient();
  db.$connect();
}

export { db };
