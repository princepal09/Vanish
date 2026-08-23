import { Router } from "express";
import {
    checkNoteController,
  createNoteController,
  revealNoteController,
} from "../controllers/note.controller.js";

const router = Router();

router.post("/", createNoteController);
router.post("/:token/reveal", revealNoteController);
router.get("/:token", checkNoteController);

export default router;
