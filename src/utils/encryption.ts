import CryptoJS from "crypto-js";
import { ENCRYPTION_SECRET } from "../constants";

// ✅ Encrypt Private Key
export const encryptPrivateKey = (privateKey: string): string => {
  // Get encryption key from environment variables

  return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_SECRET).toString();
};

// ✅ Decrypt Private Key
export const decryptPrivateKey = (encryptedKey: string): string => {
  // Get encryption key from environment variables
  
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
