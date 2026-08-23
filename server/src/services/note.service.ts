import crypto from "crypto";
import bcrypt from "bcrypt";
import sql from "mssql";
import { decrypt, encrypt } from "../utils/encryption.js";
import {
  CreateNoteInput,
  ExpiryOption,
  RevealNoteInput,
} from "../types/note.type.js";
import { connectDB } from "../config/database.js";
import { recordNoteEvent } from "./note-event.service.js";

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
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    default:
      throw new Error("Invalid expiry option");
  }
};

const MAX_FAILED_ATTEMPTS = 5;

export const createNote = async ({
  secret,
  expiry,
  passphrase,
}: CreateNoteInput) => {
  //   Generate a secure random token for the URL
  const token = crypto.randomBytes(32).toString("hex");

  // Encrypt the secret

  const { encryptedPayload, iv, authTag } = encrypt(secret);

  // Calculate expiry date
  const expiresAt = getExpiryDate(expiry);

  // Hash hashphrase if provided
  let passphraseHash: string | null = null;

  if (passphrase) {
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
    .input("passphraseHash", sql.NVarChar(255), passphraseHash).query(`
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
  await recordNoteEvent(token, "CREATED");

  return {
    token,
    expiresAt,
  };
};

export const revealNote = async ({ token, passphrase }: RevealNoteInput) => {
  const pool = await connectDB();

  // ---------------------------------------
  // STEP 1
  // Get note metadata
  //
  // We don't get the secret yet.
  // ---------------------------------------

  const metadataResult = await pool
    .request()
    .input("token", sql.NVarChar(128), token).query(`
      SELECT
        token,
        passphraseHash,
        failedAttempts,
        expiresAt
      FROM dbo.Notes
      WHERE token = @token
    `);

  if (metadataResult.recordset.length === 0) {
    return {
      status: "GONE" as const,
    };
  }

  const note = metadataResult.recordset[0];

  // ---------------------------------------
  // STEP 2
  // Check expiry
  // ---------------------------------------

  if (new Date(note.expiresAt) <= new Date()) {
    // Remove expired note
    await pool.request().input("token", sql.NVarChar(128), token).query(`
        DELETE FROM dbo.Notes
        WHERE token = @token
          AND expiresAt <= SYSUTCDATETIME()
      `);

    return {
      status: "GONE" as const,
    };
  }

  // ---------------------------------------
  // STEP 3
  // Check passphrase requirement
  // ---------------------------------------

  const hasPassphrase = !!note.passphraseHash;

  if (hasPassphrase && !passphrase) {
    return {
      status: "PASSPHRASE_REQUIRED" as const,
    };
  }

  // ---------------------------------------
  // STEP 4
  // Verify passphrase
  // ---------------------------------------

  if (hasPassphrase) {
    const isCorrect = await bcrypt.compare(passphrase!, note.passphraseHash);

    if (!isCorrect) {
      // Atomically increment failed attempts
      const failedAttemptResult = await pool
        .request()
        .input("token", sql.NVarChar(128), token)
        .input("maxAttempts", sql.Int, MAX_FAILED_ATTEMPTS).query(`
          UPDATE dbo.Notes
          SET failedAttempts = failedAttempts + 1
          OUTPUT inserted.failedAttempts
          WHERE token = @token
            AND expiresAt > SYSUTCDATETIME()
            AND failedAttempts < @maxAttempts
        `);

      // Note may have disappeared because another request
      // consumed it.
      if (failedAttemptResult.recordset.length === 0) {
        return {
          status: "GONE" as const,
        };
      }

      const failedAttempts = failedAttemptResult.recordset[0].failedAttempts;

      // -----------------------------------
      // Maximum failed attempts reached
      // -----------------------------------

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await pool.request().input("token", sql.NVarChar(128), token).query(`
            DELETE FROM dbo.Notes
            WHERE token = @token
          `);

        return {
          status: "TOO_MANY_ATTEMPTS" as const,
        };
      }

      return {
        status: "INVALID_PASSPHRASE" as const,
        attemptsRemaining: MAX_FAILED_ATTEMPTS - failedAttempts,
      };
    }
  }

  // ---------------------------------------
  // STEP 5
  // ATOMIC READ + BURN
  // ---------------------------------------
  //
  // This is the important part.
  //
  // DELETE + OUTPUT happens as ONE SQL statement.
  //
  // Only ONE concurrent request can delete
  // this row.
  // ---------------------------------------

  const burnResult = await pool
    .request()
    .input("token", sql.NVarChar(128), token).query(`
    DELETE FROM dbo.Notes
    OUTPUT
      DELETED.encryptedPayload,
      DELETED.iv,
      DELETED.authTag,
      DELETED.expiresAt
    WHERE token = @token
      AND expiresAt > SYSUTCDATETIME()
  `);

  if (burnResult.recordset.length === 0) {
    return {
      status: "GONE" as const,
    };
  }

  // Record that the note was burned
  await recordNoteEvent(token, "BURNED");

  const deletedNote = burnResult.recordset[0];

  // ---------------------------------------
  // STEP 7
  // Decrypt secret
  // ---------------------------------------

  const secret = decrypt(
    deletedNote.encryptedPayload,
    deletedNote.iv,
    deletedNote.authTag,
  );

  return {
    status: "REVEALED" as const,
    secret,
  };
};

export const checkNote = async (token: string) => {
  const pool = await connectDB();

  const result = await pool
    .request()
    .input("token", sql.NVarChar(128), token)
    .query(
      `SELECT token, expiresAt, passphraseHash FROM dbo.Notes Where token = @token`,
    );

  if (result.recordset.length === 0) {
    return {
      status: "GONE" as const,
    };
  }

  const note = result.recordset[0];

  if (new Date(note.expiresAt) <= new Date()) {
    await pool.request().input("token", sql.NVarChar(128), token).query(`
        DELETE FROM dbo.Notes
        WHERE token = @token
          AND expiresAt <= SYSUTCDATETIME()
      `);

    return {
      status: "GONE" as const,
    };
  }

  return {
    status: "AVAILABLE" as const,
    requiresPassphrase: !!note.passphrase,
  };
};
