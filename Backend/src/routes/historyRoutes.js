import express from "express";
import BattleHistory from "../models/battleHistory.js";

const router = express.Router();

// ✅ SAVE battle history
router.post("/save", async (req, res) => {
  try {
    const { battle, result, story } = req.body;

    console.log(
      "📦 SAVE PAYLOAD:",
      JSON.stringify({ battle, result, story }, null, 2)
    );

    if (!battle || !result) {
      return res
        .status(400)
        .json({ error: "battle and result are required" });
    }

    // ✅ Minimal validation (prevents saving broken docs)
    if (!battle.battleId) {
      return res.status(400).json({ error: "battleId is required" });
    }

    // ✅ Normalize score to Number (model expects Number)
    const normalizedScore =
      typeof result.score === "number" ? result.score : Number(result.score || 0);

    // ✅ Normalize winner (supports: t1, t2, DRAW)
    const normalizedWinner = result.winnerTrainerId || "unknown";

    const entry = new BattleHistory({
      battleId: battle.battleId,
      trainerAId: battle.trainerAId,
      trainerBId: battle.trainerBId,
      pokemonAId: battle.pokemonAId,
      pokemonBId: battle.pokemonBId,

      winnerTrainerId: normalizedWinner,
      score: normalizedScore,

      // ✅ NEW (recommended): store breakdown from buildResult()
      breakdown: result.breakdown ?? undefined,

      rounds: battle.rounds,
      events: battle.events ?? [],
      story: story ?? null,
    });

    await entry.save();
    return res.json({ success: true, id: entry._id });
  } catch (err) {
    // ✅ Duplicate battleId → already saved
    if (err.code === 11000) {
      // Return the existing record id also (helps frontend)
      const existing = await BattleHistory.findOne({
        battleId: req.body?.battle?.battleId,
      })
        .select("_id")
        .lean();

      return res.json({
        success: true,
        note: "Already saved",
        id: existing?._id ?? null,
      });
    }

    console.error("❌ SAVE ERROR:", err);
    return res.status(500).json({ error: "Failed to save", details: err.message });
  }
});

// ✅ FETCH all battle history (newest first)
router.get("/all", async (req, res) => {
  try {
    const history = await BattleHistory.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json(history);
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;