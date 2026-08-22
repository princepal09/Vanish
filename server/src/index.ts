import dotenv from "dotenv";
import app from "./app.js";
import { PORT } from "./config/config.js";
import { connectDB } from "./config/database.js";
import { startCleanupJob } from "./services/cleanup.job.js";

async function startServer() {
  try {
    await connectDB();
    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
