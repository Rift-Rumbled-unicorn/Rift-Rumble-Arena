import express from "express";
import {
  startBattle,
  advanceRound,
  nextRound,
} from "../controllers/battleController.js";

const router = express.Router();

// ✅ Real API routes only (no GET demos)
router.post("/start", startBattle);
router.post("/advance", advanceRound);
router.post("/next", nextRound);

export default router;
