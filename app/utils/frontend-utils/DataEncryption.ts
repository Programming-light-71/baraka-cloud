/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from "crypto-js";

const secretKey = "your-secret-key"; // Use a strong secret key

// Encrypt
export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

// Decrypt
export const decryptData = (cipherText: string) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// const encrypted = encryptData("Hello, World!");
// console.log("Encrypted:", encrypted);

// const decrypted = decryptData(encrypted);
// console.log("Decrypted:", decrypted);
