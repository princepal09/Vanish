import crypto from "crypto";
import bcrypt from "bcrypt";
import sql from "mssql";
import { encrypt } from "../utils/encryption.js";
import { CreateNoteInput, ExpiryOption } from "../types/note.type.js";
import { connectDB } from "../config/database.js";

const getExpiryDate = (expiry: ExpiryOption): Date => {
  const now = new Date();

  switch (expiry) {
    case "5m":
      return new Date(now.getTime() + 5 * 60 * 1000);

    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);

    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 10000);

    default:
      throw new Error("Invalid expiry option");
  }
};


export const createNote = async({secret, expiry, passphrase} : CreateNoteInput)  => {
    //   Generate a secure random token for the URL
    const token = crypto.randomBytes(32).toString("hex");


    // Encrypt the secret 

    const {encryptedPayload, iv, authTag} = encrypt(secret);

    // Calculate expiry date 
    const expiresAt = getExpiryDate(expiry);

    // Hash hashphrase if provided 
    let passphraseHash : string | null = null;

    if(passphrase){
        passphraseHash = await bcrypt.hash(passphrase, 12);
    }
    
    const pool = await connectDB();

     await pool
    .request()
    .input("token", sql.NVarChar(128), token)
    .input("encryptedPayload", sql.VarBinary(sql.MAX), encryptedPayload)
    .input("iv", sql.VarBinary(32), iv)
    .input("authTag", sql.VarBinary(32), authTag)
    .input("expiresAt", sql.DateTime2, expiresAt)
    .input("passphraseHash", sql.NVarChar(255), passphraseHash)
    .query(`
      INSERT INTO dbo.Notes (
        token,
        encryptedPayload,
        iv,
        authTag,
        expiresAt,
        passphraseHash
      )
      VALUES (
        @token,
        @encryptedPayload,
        @iv,
        @authTag,
        @expiresAt,
        @passphraseHash
      )
    `);

  return {
    token,
    expiresAt,
  };
};

