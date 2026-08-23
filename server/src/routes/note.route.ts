import { Router } from "express";
import {
  checkNoteController,
  createNoteController,
  revealNoteController,
} from "../controllers/note.controller.js";
import { noteCreationLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/", noteCreationLimiter, createNoteController);
router.post("/:token/reveal", revealNoteController);
router.get("/:token", checkNoteController);

export default router;
