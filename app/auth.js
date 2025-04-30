/* eslint-disable no-undef */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js"; // Fix here! 
import input from "input"; // For user input
import dotenv from "dotenv";

dotenv.config();

const APP_ID = Number(26287475);
const APP_HASH = "039ce3f8d98d89d307995655fa6ba2ac";
const session = new StringSession(""); // New session

const client = new TelegramClient(session, APP_ID, APP_HASH, { connectionRetries: 5 });

(async () => {
  await client.start({
    phoneNumber: async () => await input.text("Enter your phone number: "),
    phoneCode: async () => await input.text("Enter the OTP sent to Telegram: "),
    password: async () => await input.text("Enter your 2FA password (if set): "),
    onError: (err) => console.log(err),
  });

  console.log("✅ Successfully logged in!");
  console.log("🔑 Your session string:", client.session.save());

  // Save session string in `.env` file
  console.log("🔹 Save this session in your .env file like this:");
  console.log(`TELEGRAM_SESSION="${client.session.save()}"`);

  await client.disconnect();
})();
