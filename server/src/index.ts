import dotenv from "dotenv";
import app from "./app.js";
import { PORT } from "./config/config.js";
import { connectDB } from "./config/database.js";

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
