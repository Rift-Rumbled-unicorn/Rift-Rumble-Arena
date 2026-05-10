export const MATCHUP_RULES = {
  // Pikachu vs Charizard (A=pk1, B=pk2) -> Charizard wins 0–3
  "pk1_vs_pk2": [
    {
      roundNo: 1,
      p1Move: "Thunderbolt",
      p2Move: "Smokescreen",
      p1WinProb: 0.38,
      p2WinProb: 0.62,
      winner: "P2",
      reason:
        "Smokescreen drops accuracy; Roost heals Fire damage",
    },
    {
      roundNo: 2,
      p1Move: "Thunder Wave",
      p2Move: "Roost",
      p1WinProb: 0.44,
      p2WinProb: 0.56,
      winner: "P2",
      reason:
        "Roost restores HP faster than Thunder Wave can wear down",
    },
    {
      roundNo: 3,
      p1Move: "Double Team",
      p2Move: "Flamethrower",
      p1WinProb: 0.42,
      p2WinProb: 0.58,
      winner: "P2",
      reason:
        "Flamethrower burns through evasion; Fire > Electric",
    },
  ],

  // Pikachu vs Bulbasaur (A=pk1, B=pk3) -> Pikachu wins 3–0
  "pk1_vs_pk3": [
    {
      roundNo: 1,
      p1Move: "Thunder Wave",
      p2Move: "Leech Seed",
      p1WinProb: 0.60,
      p2WinProb: 0.40,
      winner: "P1",
      reason:
        "Thunder Wave paralyzes before Leech Seed is planted",
    },
    {
      roundNo: 2,
      p1Move: "Thunderbolt",
      p2Move: "Synthesis",
      p1WinProb: 0.55,
      p2WinProb: 0.45,
      winner: "P1",
      reason:
        "Thunderbolt deals more burst damage than Synthesis can heal",
    },
    {
      roundNo: 3,
      p1Move: "Double Team",
      p2Move: "Vine Whip",
      p1WinProb: 0.58,
      p2WinProb: 0.42,
      winner: "P1",
      reason:
        "Evasion stacking causes Vine Whip to miss repeatedly",
    },
  ],

  // Charizard vs Pikachu (A=pk2, B=pk1) -> Charizard wins 3–0
  "pk2_vs_pk1": [
    {
      roundNo: 1,
      p1Move: "Smokescreen",
      p2Move: "Thunderbolt",
      p1WinProb: 0.62,
      p2WinProb: 0.38,
      winner: "P1",
      reason:
        "Accuracy drop makes Thunderbolt miss; Roost heals remainder",
    },
    {
      roundNo: 2,
      p1Move: "Flamethrower",
      p2Move: "Thunder Wave",
      p1WinProb: 0.58,
      p2WinProb: 0.42,
      winner: "P1",
      reason:
        "Speed advantage lets Charizard attack before paralysis sets",
    },
    {
      roundNo: 3,
      p1Move: "Roost",
      p2Move: "Double Team",
      p1WinProb: 0.56,
      p2WinProb: 0.44,
      winner: "P1",
      reason:
        "Roost recovery out-sustains Double Team evasion stalling",
    },
  ],

  // Charizard vs Bulbasaur (A=pk2, B=pk3) -> Charizard wins 3–0
  "pk2_vs_pk3": [
    {
      roundNo: 1,
      p1Move: "Flamethrower",
      p2Move: "Leech Seed",
      p1WinProb: 0.72,
      p2WinProb: 0.28,
      winner: "P1",
      reason:
        "Fire is 4x effective vs Grass; Leech Seed too slow",
    },
    {
      roundNo: 2,
      p1Move: "Smokescreen",
      p2Move: "Synthesis",
      p1WinProb: 0.68,
      p2WinProb: 0.32,
      winner: "P1",
      reason:
        "Smokescreen then Flamethrower; Synthesis can't keep up",
    },
    {
      roundNo: 3,
      p1Move: "Dragon Tail",
      p2Move: "Vine Whip",
      p1WinProb: 0.65,
      p2WinProb: 0.35,
      winner: "P1",
      reason:
        "Dragon Tail forces switch cancelling Synthesis heal stacks",
    },
  ],

  // Bulbasaur vs Pikachu (A=pk3, B=pk1) -> Pikachu wins 0–3 (so P2 wins)
  "pk3_vs_pk1": [
    {
      roundNo: 1,
      p1Move: "Leech Seed",
      p2Move: "Thunder Wave",
      p1WinProb: 0.40,
      p2WinProb: 0.60,
      winner: "P2",
      reason:
        "Thunder Wave faster; Pikachu paralysis prevents Leech Seed",
    },
    {
      roundNo: 2,
      p1Move: "Vine Whip",
      p2Move: "Thunderbolt",
      p1WinProb: 0.45,
      p2WinProb: 0.55,
      winner: "P2",
      reason:
        "Electric neutral on Grass; Thunderbolt higher power wins",
    },
    {
      roundNo: 3,
      p1Move: "Synthesis",
      p2Move: "Double Team",
      p1WinProb: 0.42,
      p2WinProb: 0.58,
      winner: "P2",
      reason:
        "Synthesis stall fails when Thunderbolt crits through evasion",
    },
  ],

  // Bulbasaur vs Charizard (A=pk3, B=pk2) -> Charizard wins 0–3 (so P2 wins)
  "pk3_vs_pk2": [
    {
      roundNo: 1,
      p1Move: "Leech Seed",
      p2Move: "Flamethrower",
      p1WinProb: 0.28,
      p2WinProb: 0.72,
      winner: "P2",
      reason:
        "Flamethrower KOs before Leech Seed drains enough",
    },
    {
      roundNo: 2,
      p1Move: "Synthesis",
      p2Move: "Smokescreen",
      p1WinProb: 0.32,
      p2WinProb: 0.68,
      winner: "P2",
      reason:
        "Smokescreen then Flamethrower; Synthesis can't outheal Fire",
    },
    {
      roundNo: 3,
      p1Move: "Vine Whip",
      p2Move: "Dragon Tail",
      p1WinProb: 0.35,
      p2WinProb: 0.65,
      winner: "P2",
      reason:
        "Dragon Tail switches Bulbasaur out ending Synthesis stacks",
    },
  ],
};

export function getRoundRule(pokemonAId, pokemonBId, roundNo) {
  const key = `${pokemonAId}_vs_${pokemonBId}`;
  const rules = MATCHUP_RULES[key];
  if (!rules) return null;
  return rules.find((r) => r.roundNo === roundNo) ?? null;
}