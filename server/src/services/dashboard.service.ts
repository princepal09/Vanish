import { connectDB } from "../config/database.js";
import { DashboardStats } from "../types/dashboard.type.js";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const pool = await connectDB();

  const result = await pool.request().query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM dbo.NoteEvents
          WHERE eventType = 'CREATED'
        ) AS totalCreated,

        (
          SELECT COUNT(*)
          FROM dbo.NoteEvents
          WHERE eventType = 'BURNED'
        ) AS totalBurned,

        (
          SELECT COUNT(*)
          FROM dbo.NoteEvents
          WHERE eventType = 'EXPIRED'
        ) AS totalExpired,

        (
          SELECT COUNT(*)
          FROM dbo.Notes
        ) AS currentlyAlive;
    `);

  const stats = result.recordset[0];

  return {
    totalCreated: Number(stats.totalCreated),
    totalBurned: Number(stats.totalBurned),
    totalExpired: Number(stats.totalExpired),
    currentlyAlive: Number(stats.currentlyAlive),
  };
};
