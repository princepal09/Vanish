import crypto from "crypto";
import { ENCRYPTION_KEY } from "../config/config.js";

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = (): Buffer => {
  const key = ENCRYPTION_KEY;

  if (!key) {
    throw new Error("Encryption key is not defined");
  }

  // Convert a 64-character hex string into 32 bytes
  const keyBuffer = Buffer.from(key, "hex");

  if (keyBuffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hexadecimal string");
  }

  return keyBuffer;
};

export interface EncryptedData {
  encryptedPayload: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

export const encrypt = (text: string) => {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedPayload = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedPayload,
    iv,
    authTag,
  };
};

export const decrypt = (
  encryptedPayload: Buffer,
  iv: Buffer,
  authTag: Buffer,
): string => {
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedPayload),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
};
