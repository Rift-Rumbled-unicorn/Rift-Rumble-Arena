export function buildStory({ battle, result, trainers, pokemons }) {
  const trainerAName = getTrainerName(trainers, battle.trainerAId);
  const trainerBName = getTrainerName(trainers, battle.trainerBId);
  const isDraw = result.winnerTrainerId === "DRAW";
  const winnerName = isDraw ? null : getTrainerName(trainers, result.winnerTrainerId);
  const wins = countWins(battle);

  const events = battle.events ?? [];
  const highlights = events
    .filter((e) => e.type === "ROUND_RESULT" || e.type === "MOVE_USED")
    .slice(-5)
    .map((e) => {
      const actorTrainer = getTrainerName(trainers, e.actorTrainerId);
      const actorPokemon = getPokemonName(pokemons, e.actorPokemonId);
      if (e.move) {
        return `Round ${e.roundNo}: ${actorTrainer}'s ${actorPokemon} used ${e.move}.`;
      }
      return e.text ?? `Round ${e.roundNo}: ${e.reason ?? "event"}`;
    });

  let summary;
  let winnerCard;

  if (isDraw) {
    summary = `${trainerAName} and ${trainerBName} clashed in a fierce 3-round battle, but neither could claim victory. It ended in a DRAW!`;
    winnerCard = {
      name: "DRAW",
      roundsWon: 0,
      pokemon: "None",
      keyMoment: highlights[highlights.length - 1] ?? "An evenly matched contest.",
    };
  } else {
    const winnerWins = wins[result.winnerTrainerId] ?? 0;
    const winnerPokemonId =
      result.winnerTrainerId === battle.trainerAId ? battle.pokemonAId : battle.pokemonBId;

    summary = `${trainerAName} and ${trainerBName} faced off in a 3-round clash. ${winnerName} won ${winnerWins} round(s) and sealed the match with a strong finish.`;
    winnerCard = {
      name: winnerName,
      roundsWon: winnerWins,
      pokemon: getPokemonName(pokemons, winnerPokemonId),
      keyMoment: highlights[highlights.length - 1] ?? "A decisive final moment.",
    };
  }

  return {
    title: `Arena Rewind: ${trainerAName} vs ${trainerBName}`,
    summary,
    highlights: highlights.length ? highlights : ["No highlights recorded yet."],
    winnerCard,
  };
}