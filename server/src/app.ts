import express, { Request, Response } from "express";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import { CLIENT_URL } from "./config/config.js";
import noteRoutes from "./routes/note.route.js"

const app = express();

app.use(cors({
    origin : CLIENT_URL,
    credentials : true
}));
app.use(express.json());



app.use("/api/v1/notes", noteRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Vanish API is running",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use(errorMiddleware);

export default app;
