import sql, { connectDB } from "../config/database.js";

export type NoteEventType = "CREATED" | "BURNED" | "EXPIRED";

export const recordNoteEvent = async (
  token: string,
  eventType: NoteEventType,
): Promise<void> => {
  const pool = await connectDB();
  await pool
    .request()
    .input("token", sql.NVarChar(128), token)
    .input("eventType", sql.NVarChar(20), eventType).query(`
      INSERT INTO dbo.NoteEvents (
        token,
        eventType
      )
      VALUES (
        @token,
        @eventType
      );
    `);
};
