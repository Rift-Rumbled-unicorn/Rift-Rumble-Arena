const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
// ✅ Start a new battle
export async function startBattle({ pokemonAId, pokemonBId }) {
  const res = await fetch(`${BASE_URL}/battle/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pokemonAId, pokemonBId }),
  });
  if (!res.ok) throw new Error("Failed to start battle");
  return res.json();
}

// ✅ Advance (complete current round)
export async function advanceBattle(battle) {
  const res = await fetch(`${BASE_URL}/battle/advance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battle }),
  });
  if (!res.ok) throw new Error("Failed to advance battle");
  return res.json();
}

// ✅ Start next round
export async function startNextRound(battle) {
  const res = await fetch(`${BASE_URL}/battle/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battle }),
  });
  if (!res.ok) throw new Error("Failed to start next round");
  return res.json();
}

// ✅ Save battle history to MongoDB
export async function saveBattleHistory({ battle, result, story }) {
  const res = await fetch(`${BASE_URL}/history/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ battle, result, story }),
  });
  if (!res.ok) throw new Error("Failed to save battle history");
  return res.json();
}

// ✅ Fetch all battle history from MongoDB
export async function fetchBattleHistory() {
  const res = await fetch(`${BASE_URL}/history/all`);
  if (!res.ok) throw new Error("Failed to fetch battle history");
  return res.json();
}