/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from "telegram";
import { telegram } from "../../../../services/telegram.server";

export async function invokeWithRetry(
  method: any,
  params: any,
  maxRetries = 5,
  delay = 5000
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await telegram?.invoke(new method(params));
    } catch (error) {
      const errorMsg = error.message.toUpperCase();

      // Handle FLOOD_WAIT_X
      const floodWaitMatch = errorMsg.match(/FLOOD_WAIT_(\d+)/);
      if (floodWaitMatch) {
        const waitTime = parseInt(floodWaitMatch[1], 10);
        console.warn(
          `Rate limited! Waiting ${waitTime} seconds before retrying...`
        );
        await new Promise((res) => setTimeout(res, waitTime * 1000));
        attempt++;
        continue;
      }

      // Handle other errors...
      if (
        errorMsg.includes("TIMEOUT") ||
        errorMsg.includes("NOT CONNECTED") ||
        errorMsg.includes("RPC_CALL_FAIL")
      ) {
        console.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${
            delay / 1000
          } seconds...`
        );
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
      } else {
        throw error; // If error is not retryable, throw it immediately
      }
    }
  }
  throw new Error(
    `Max retry attempts (${maxRetries}) reached for ${method.name}`
  );
}
