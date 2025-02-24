import { PrismaClient } from "@prisma/client";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

let db: PrismaClient | undefined;
let storeClient: TelegramClient | undefined;

// this is needed because in development we don't want to restart

(async () => {
  if (!db && !storeClient) {
    db = new PrismaClient();
    await db.$connect();

    // store
    const APP_ID = Number(process.env.Tel_APP_ID);
    const APP_HASH = process.env.Tel_APP_HASH as string;
    const BOT_TOKEN = process.env.Tel_BOT_TOKEN as string;

    const SESSION = new StringSession("");

    storeClient = new TelegramClient(SESSION, APP_ID, APP_HASH, {
      connectionRetries: 5,
    });
    await storeClient.connect();
    await storeClient.start({ botAuthToken: BOT_TOKEN });
  }
})();
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (!db) {
  db = new PrismaClient();
  await db.$connect();
}
if (!storeClient) {
  // env
  const APP_ID = Number(process.env.Tel_APP_ID);
  const APP_HASH = process.env.Tel_APP_HASH as string;
  const BOT_TOKEN = process.env.Tel_BOT_TOKEN as string;

  const SESSION = new StringSession("");

  storeClient = new TelegramClient(SESSION, APP_ID, APP_HASH, {
    connectionRetries: 5,
  });
  await storeClient.connect();
  await storeClient.start({
    botAuthToken: BOT_TOKEN,
    onError: (err) => console.log(err),
  });
}

export { db, storeClient };
