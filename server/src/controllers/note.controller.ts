import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { createNote, revealNote } from "../services/note.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { FRONTEND_URL } from "../config/config.js";

export const createNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const { secret, expiry, passphrase } = req.body;

    if (!secret || typeof secret !== "string") {
      throw new ApiError(400, "Secret is required");
    }

    if (!expiry) {
      throw new ApiError(400, "Expiry is required");
    }

    const allowedExpires = ["5m", "1h", "24d", "7d"];

    if (!allowedExpires.includes(expiry)) {
      throw new ApiError(400, "Invalid Expiry Option");
    }

    const note = await createNote({
      secret,
      expiry,
      passphrase,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          token: note.token,
          expiresAt: note.expiresAt,
          url: `${FRONTEND_URL}/api/v1/notes/${note.token}`,
        },
        "Secret Note Created Successfully",
      ),
    );
  },
);

export const revealNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.params.token as string;

    const { passphrase } = req.body;

    if (!token) {
      throw new ApiError(400, "Token is required");
    }

    const result = await revealNote({
      token,
      passphrase,
    });

    console.log("REVEAL RESULT:", result);

    // NOTE DOESN'T EXIST / ALREADY BURNED / EXPIRED
    if (result.status === "GONE") {
      throw new ApiError(404, "This note is gone");
    }

    // PASSPHRASE REQUIRED
    if (result.status === "PASSPHRASE_REQUIRED") {
      throw new ApiError(401, "Passphrase is required");
    }

    // WRONG PASSPHRASE
    if (result.status === "INVALID_PASSPHRASE") {
      return res.status(401).json(
        new ApiResponse(
          401,
          {
            attemptsRemaining: result.attemptsRemaining,
          },
          "Incorrect passphrase",
        ),
      );
    }

    // TOO MANY ATTEMPTS
    if (result.status === "TOO_MANY_ATTEMPTS") {
      throw new ApiError(
        410,
        "Too many incorrect attempts. This note has been destroyed.",
      );
    }

    // SUCCESS
    if (result.status === "REVEALED") {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            secret: result.secret,
          },
          "Note revealed and destroyed",
        ),
      );
    }

    // Should never normally reach here
    throw new ApiError(500, "Unexpected reveal state");
  },
);
