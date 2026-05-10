import {
  createBattle,
  completeCurrentRound,
  startNextRound,
  buildResult,
} from "../services/battleEngine.js";

/**
 * POST /battle/start
 */
export function startBattle(req, res) {
  const { pokemonAId, pokemonBId } = req.body;

  if (!pokemonAId || !pokemonBId) {
    return res.status(400).json({
      error: "pokemonAId and pokemonBId are required",
    });
  }

  try {
    const battle = createBattle({
      battleId: `b-${Date.now()}`,
      trainerAId: "t1",
      trainerBId: "t2",
      pokemonAId,
      pokemonBId,
    });

    res.json({ battle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * POST /battle/advance
 */
export function advanceRound(req, res) {
  const { battle } = req.body;

  if (!battle) {
    return res.status(400).json({ error: "Battle state missing" });
  }

  try {
    const updatedBattle = completeCurrentRound(battle);

    if (updatedBattle.battleStatus === "COMPLETED") {
      const result = buildResult(updatedBattle);
      return res.json({ battle: updatedBattle, result });
    }

    res.json({ battle: updatedBattle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /battle/next
 */
export function nextRound(req, res) {
  const { battle } = req.body;

  if (!battle) {
    return res.status(400).json({ error: "Battle state missing" });
  }

  try {
    const updatedBattle = startNextRound(battle);
    res.json({ battle: updatedBattle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}