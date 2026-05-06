import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { startBattle } from "../services/api";
import { trainers } from "../data/mock/trainers";
import { pokemons } from "../data/mock/pokemons";

const AI_PICK_KEY = "rr_aiPickIndexByA"; // localStorage key

function loadAiPickMap() {
  try {
    return JSON.parse(localStorage.getItem(AI_PICK_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAiPickMap(map) {
  localStorage.setItem(AI_PICK_KEY, JSON.stringify(map));
}

export default function SelectionPage() {
  const navigate = useNavigate();

  const trainerA = trainers.find((t) => t.id === "t1");
  const trainerB = trainers.find((t) => t.id === "t2");

  const [pokemonAId, setPokemonAId] = useState(pokemons[0]?.id ?? "");
  const [aiPickMap, setAiPickMap] = useState(() => loadAiPickMap());
  const [isLoading, setIsLoading] = useState(false);

  function handlePlayerSelect(e) {
    const nextA = e.target.value;
    setPokemonAId(nextA);

    // ✅ Ensure this A has a stored index (start from 0)
    setAiPickMap((prev) => {
      const updated = { ...prev };
      if (updated[nextA] == null) updated[nextA] = 0;
      saveAiPickMap(updated);
      return updated;
    });
  }

  const availableOpponents = useMemo(() => {
    // ✅ preserves pokemons[] order
    return pokemons.filter((p) => p.id !== pokemonAId);
  }, [pokemonAId]);

  const aiIndexForThisA = aiPickMap[pokemonAId] ?? 0;

  const pokemonBId = useMemo(() => {
    if (availableOpponents.length === 0) return "";
    return availableOpponents[aiIndexForThisA % availableOpponents.length].id;
  }, [availableOpponents, aiIndexForThisA]);

  const pokemonA = pokemons.find((p) => p.id === pokemonAId);
  const pokemonB = pokemons.find((p) => p.id === pokemonBId);

  async function handleGoToBattlefield() {
    if (!pokemonAId || !pokemonBId) {
      alert("Choose a valid Pokémon A (and ensure at least 2 pokémons exist).");
      return;
    }

    setIsLoading(true);
    try {
      const data = await startBattle({ pokemonAId, pokemonBId });

      // ✅ after successful start, advance AI index FOR THIS A (persisted)
      setAiPickMap((prev) => {
        const updated = { ...prev };
        const cur = updated[pokemonAId] ?? 0;
        updated[pokemonAId] = cur + 1;
        saveAiPickMap(updated);
        return updated;
      });

      navigate("/battle/play", { state: { battle: data.battle }, replace: true });
    } catch (err) {
      console.error(err);
      alert("Failed to start battle!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="battle-arena">
      <div className="round-summary">
        <h3>🎮 Choose Your Pokémon</h3>
        <p className="muted" style={{ textAlign: "center", marginTop: 4 }}>
          Pick Pokémon A. AI will rotate Pokémon B in all valid orders.
        </p>

        {/* ✅ Show which pair this selection will produce */}
        <p className="muted" style={{ textAlign: "center", marginTop: 8, fontSize: 12 }}>
          Next Matchup: <strong>{pokemonA?.name ?? "—"}</strong> vs{" "}
          <strong>{pokemonB?.name ?? "—"}</strong>
        </p>
      </div>

<div className="battle-panels">
        {/* Trainer A */}
        <div className="trainer-card">
          <div className="trainer-name">{trainerA?.name}</div>
          <div className="pokemon-image">
            {pokemonA && <img src={pokemonA.image} alt={pokemonA.name} />}
          </div>
          <div className="move-box">
            <strong>Select Pokémon (A)</strong>
            <select value={pokemonAId} onChange={handlePlayerSelect}>
              {pokemons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trainer B */}
        <div className="trainer-card">
          <div className="trainer-name">{trainerB?.name} (AI)</div>
          <div className="pokemon-image">
            {pokemonB && <img src={pokemonB.image} alt={pokemonB.name} />}
          </div>

          {/* ✅ Shows the rotation index for this selected A */}
          <p className="muted" style={{ fontSize: 12, textAlign: "center" }}>
            AI cycle for {pokemonA?.name}: pick #{(aiIndexForThisA % (availableOpponents.length || 1)) + 1} →{" "}
            {pokemonB?.name}
          </p>
        </div>
      </div>

      {/* GO TO BATTLEFIELD */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          className="timer-pill"
          style={{
            cursor: isLoading ? "wait" : "pointer",
            fontSize: 18,
            padding: "14px 40px",
            opacity: isLoading ? 0.6 : 1,
          }}
          onClick={handleGoToBattlefield}
          disabled={isLoading}
        >
          {isLoading ? "⏳ Preparing..." : "⚔️ Let's Go to Battlefield!"}
        </button>
      </div>
    </div>
  );
}