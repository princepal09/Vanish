import { connectDB } from "../config/database.js";

import { recordNoteEvent } from "./note-event.service.js";

export const cleanUpExpiredNotes = async (): Promise<void> => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
          DELETE FROM dbo.Notes

          OUTPUT
            DELETED.token

          WHERE expiresAt <= SYSUTCDATETIME();
        `);

    const deletedTokens = result.recordset as {
      token: string;
    }[];

    for (const note of deletedTokens) {
      await recordNoteEvent(note.token, "EXPIRED");
    }

    if (deletedTokens.length > 0) {
      console.log(`Expired notes cleaned up: ${deletedTokens.length}`);
    }
  } catch (error) {
    console.error("Expired notes cleanup failed:", error);
  }
};
