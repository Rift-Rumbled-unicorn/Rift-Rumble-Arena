import crypto from "crypto";
import {
  RoundStatus,
  BattleStatus,
  ROUND_MAX_HP,
  ROUND_DURATION_SEC,
  TOTAL_ROUNDS,
  DRAW,
} from "../domain/constants.js";

import { getRoundRule } from "./matchupRules.js";

/**
 * ✅ Outcome per round:
 * AI = 30%, DRAW = 25%, HUMAN = 45%
 */
function pickOutcome() {
  const r = Math.random();
  if (r < 0.30) return "AI";
  if (r < 0.55) return "DRAW";
  return "HUMAN";
}

/**
 * ✅ Creates a fresh battle object (used by POST /battle/start)
 * Keeps structure aligned with your existing frontend & routes.
 */
export function createBattle({
  battleId,
  trainerAId = "t1",
  trainerBId = "t2",
  pokemonAId,
  pokemonBId,
}) {
  if (!pokemonAId || !pokemonBId) {
    throw new Error("pokemonAId and pokemonBId are required");
  }
  if (pokemonAId === pokemonBId) {
    throw new Error("pokemonAId and pokemonBId must be different");
  }

  const id = battleId || crypto.randomUUID();

  const rounds = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
    roundNo: i + 1,
    status: i === 0 ? RoundStatus.IN_PROGRESS : RoundStatus.NOT_STARTED,
    winnerTrainerId: null, // "t1" | "t2" | "DRAW"
  }));

  return {
    battleId: id,
    trainerAId,
    trainerBId,
    pokemonAId,
    pokemonBId,

    rounds,
    currentRound: 1,
    roundDurationSec: ROUND_DURATION_SEC,
    battleStatus: BattleStatus.IN_PROGRESS,

    // HP starts full for both
    hp: {
      [trainerAId]: ROUND_MAX_HP,
      [trainerBId]: ROUND_MAX_HP,
    },

    roundMeta: null,
    pendingNextRound: false,
    nextRoundNo: null,

    events: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * ✅ Completes the current round ONLY.
 * - sets winner (t1/t2/DRAW)
 * - sets HP: winner=full loser=0, draw => half/half
 * - attaches roundMeta (moves + probs + reason)
 * - sets pendingNextRound = true (frontend will wait 5 sec)
 * - DOES NOT auto-start next round
 */
export function completeCurrentRound(battle) {
  if (!battle) throw new Error("battle is required");
  if (battle.battleStatus === BattleStatus.COMPLETED) return battle;

  const roundNo = battle.currentRound;

  const currentRoundObj = battle.rounds?.find((r) => r.roundNo === roundNo);
  if (!currentRoundObj) throw new Error("Current round not found");

  // If already completed, don't complete again
  if (currentRoundObj.status === RoundStatus.COMPLETED) return battle;

  const rule = getRoundRule(battle.pokemonAId, battle.pokemonBId, roundNo);
  if (!rule) throw new Error("Matchup rule missing");


 // ✅ Pick outcome by probability
  const outcome = pickOutcome();

  let winnerTrainerId = null;
  let loserTrainerId = null;

  if (outcome === "HUMAN") {
    winnerTrainerId = battle.trainerAId;
    loserTrainerId = battle.trainerBId;
  } else if (outcome === "AI") {
    winnerTrainerId = battle.trainerBId;
    loserTrainerId = battle.trainerAId;
  } else {
    winnerTrainerId = DRAW; // "DRAW"
  }

  // ✅ HP rule
  let hp = {};
  if (winnerTrainerId === DRAW) {
    const half = Math.ceil(ROUND_MAX_HP / 2);
    hp = {
      [battle.trainerAId]: half,
      [battle.trainerBId]: half,
    };
  } else {
    hp = {
      [winnerTrainerId]: ROUND_MAX_HP,
      [loserTrainerId]: 0,
    };
  }

  // ✅ Mark round as completed
  const updatedRounds = battle.rounds.map((r) =>
    r.roundNo === roundNo
      ? { ...r, status: RoundStatus.COMPLETED, winnerTrainerId }
      : r
  );

  const isLastRound = roundNo === battle.rounds.length;

  const roundMeta = {
    roundNo,
    winnerTrainerId,
    outcome, // "HUMAN" | "AI" | "DRAW"
    p1Move: rule.p1Move,
    p2Move: rule.p2Move,
    p1WinProb: rule.p1WinProb,
    p2WinProb: rule.p2WinProb,
    reason:
      winnerTrainerId === DRAW
        ? "Round ended in a DRAW (25% probability rule)"
        : `${rule.reason} (probability rule)`,
  };

  const events = [
    ...(battle.events ?? []),

    // 1️⃣ Player (P1) move
    {
      roundNo,
      type: "MOVE_USED",
      actorTrainerId: battle.trainerAId,
      actorPokemonId: battle.pokemonAId,
      move: rule.p1Move,
      text: `Player used ${rule.p1Move}`,
    },

    // 2️⃣ AI (P2) move
    {
      roundNo,
      type: "MOVE_USED",
      actorTrainerId: battle.trainerBId,
      actorPokemonId: battle.pokemonBId,
      move: rule.p2Move,
      text: `AI used ${rule.p2Move}`,
    },

    // 3️⃣ Round result commentary
    {
      roundNo,
      type: "ROUND_RESULT",
      winnerTrainerId,
      reason: roundMeta.reason,
      text:
        winnerTrainerId === DRAW
          ? `Round ${roundNo} is a DRAW 🤝`
          : `Round ${roundNo} won by ${winnerTrainerId} — ${roundMeta.reason}`,
    },
  ];

  return {
    ...battle,
    rounds: updatedRounds,
    hp,
    roundMeta,
    pendingNextRound: !isLastRound,
    nextRoundNo: isLastRound ? null : roundNo + 1,
    battleStatus: isLastRound
      ? BattleStatus.COMPLETED
      : BattleStatus.IN_PROGRESS,
    events,
  };
}


/**
 * ✅ Called AFTER frontend waits 5 seconds.
 * - starts next round IN_PROGRESS
 * - resets HP back to full for the next round
 */
export function startNextRound(battle) {
  if (!battle) throw new Error("battle is required");

  if (!battle.pendingNextRound || !battle.nextRoundNo) return battle;

  const next = battle.nextRoundNo;

  const rounds = battle.rounds.map((r) =>
    r.roundNo === next ? { ...r, status: RoundStatus.IN_PROGRESS } : r
  );

  return {
    ...battle,
    rounds,
    currentRound: next,
    hp: {
      [battle.trainerAId]: ROUND_MAX_HP,
      [battle.trainerBId]: ROUND_MAX_HP,
    },
    pendingNextRound: false,
    nextRoundNo: null,
    roundMeta: null,
  };
}

/**
 * ✅ Final result supports DRAW.
 * Winner is decided by round-win counts.
 * - If aWins > bWins => trainerA wins
 * - If bWins > aWins => trainerB wins
 * - Else => DRAW
 */
export function buildResult(battle) {
  if (!battle) throw new Error("battle is required");

  let aWins = 0;
  let bWins = 0;
  let draws = 0;

  for (const r of battle.rounds ?? []) {
    if (!r.winnerTrainerId) continue;

    if (r.winnerTrainerId === battle.trainerAId) aWins++;
    else if (r.winnerTrainerId === battle.trainerBId) bWins++;
    else if (r.winnerTrainerId === DRAW) draws++;
  }

  let winnerTrainerId = DRAW;
  if (aWins > bWins) winnerTrainerId = battle.trainerAId;
  else if (bWins > aWins) winnerTrainerId = battle.trainerBId;

  const score = Math.max(aWins, bWins) * 100;

  return {
    battleId: battle.battleId,
    winnerTrainerId, // "t1" | "t2" | "DRAW"
    score,
    breakdown: { aWins, bWins, draws },
  };
}

/**
 * ✅ OPTIONAL helper:
 * Advances one step: completes current round and, if last round, builds result.
 * Useful if your /battle/advance route wants { battle, result? } in one call.
 */
export function advanceBattle(battle) {
  const updatedBattle = completeCurrentRound(battle);

  if (updatedBattle.battleStatus === BattleStatus.COMPLETED) {
    const result = buildResult(updatedBattle);
    return { battle: updatedBattle, result };
  }

  return { battle: updatedBattle };
}