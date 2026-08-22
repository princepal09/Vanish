import { cleanUpExpiredNotes } from "./cleanup.service.js";

const CLEANUP_INTERVAL = 60 * 1000;

export const startCleanupJob = (): void => {
  console.log("Expired notes cleanup job started");

  // Run immediately when the server starts
  void cleanUpExpiredNotes();

  // Run every minute
  setInterval(() => {
    void cleanUpExpiredNotes();
  }, CLEANUP_INTERVAL);
};
