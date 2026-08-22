import { Router } from "express";
import { createNoteController } from "../controllers/note.controller.js";


const router = Router();

router.post("/", createNoteController);

export default router;