import { connectDB } from "../config/database.js";

export const cleanUpExpiredNotes = async (): Promise<void> => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      DELETE FROM dbo.Notes
      WHERE expiresAt <= SYSUTCDATETIME();
    `);

    const deletedCount = result.rowsAffected[0] ?? 0;

    if (deletedCount > 0) {
      console.log(
        `Expired notes cleaned up: ${deletedCount}`
      );
    }
  } catch (error) {
    console.error(
      "Expired notes cleanup failed:",
      error
    );
  }
};