import { Router } from "express";
import { createNoteController, revealNoteController } from "../controllers/note.controller.js";


const router = Router();

router.post("/", createNoteController);
router.post("/:token/reveal", revealNoteController)


export default router;