import crypto from "crypto";

export async function generateOTP() {
  return crypto.randomInt(100000, 999999);
}
