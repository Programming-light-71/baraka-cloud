/* eslint-disable @typescript-eslint/no-explicit-any */
import { storeClient } from "../../db.server";

export async function invokeWithRetry(
  method: new (arg0: any) => any,
  params: any,
  maxRetries = 5,
  delay = 5000
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await storeClient?.invoke(new method(params));
    } catch (error) {
      if (
        error.message.includes("TIMEOUT") ||
        error.message.includes("Not connected")
      ) {
        console.warn(
          `Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${
            delay / 1000
          } seconds...`
        );
        await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
        attempt++;
      } else {
        throw error; // If error is not a timeout, throw it
      }
    }
  }
  throw new Error("Max retry attempts reached.");
}
