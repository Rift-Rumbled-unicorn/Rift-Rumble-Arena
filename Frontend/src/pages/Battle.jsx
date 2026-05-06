import "./battle.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { trainers } from "../data/mock/trainers";
import { pokemons } from "../data/mock/pokemons";
import { BattleStatus } from "../domain/constants";
import { advanceBattle, startNextRound, saveBattleHistory } from "../services/api";

export default function BattlePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialBattle = location.state?.battle;

  const [battle, setBattle] = useState(initialBattle);
  const [secondsLeft, setSecondsLeft] = useState(
    initialBattle?.roundDurationSec ?? 15
  );
  const [betweenRoundsLeft, setBetweenRoundsLeft] = useState(null);
  const [showMoveDetails, setShowMoveDetails] = useState(false);
  const [liveLines, setLiveLines] = useState([]);
  const pushedRef = useRef({ r: 0, a: false, b: false, c: false });
  const [resultDelayLeft, setResultDelayLeft] = useState(null);
  const finalPayloadRef = useRef(null);
  const pushedOfficialRoundRef = useRef({});
  const lastCompletedRoundRef = useRef(null);
  const [readyCountdown, setReadyCountdown] = useState(5);

  /* ── ALL useMemo MUST come BEFORE any conditional return ── */
  const trainerA = useMemo(
    () => trainers.find((t) => t.id === battle?.trainerAId),
    [battle]
  );
  const trainerB = useMemo(
    () => trainers.find((t) => t.id === battle?.trainerBId),
    [battle]
  );
  const pokemonA = useMemo(
    () => pokemons.find((p) => p.id === battle?.pokemonAId),
    [battle]
  );
  const pokemonB = useMemo(
    () => pokemons.find((p) => p.id === battle?.pokemonBId),
    [battle]
  );

  const plannedLines = useMemo(() => {
    if (!battle) return [];
    const p1 = pokemonA?.name ?? "Pokémon";
    const p2 = pokemonB?.name ?? "Pokémon";
    return [
      `${trainerA?.name ?? "Player"}'s ${p1} is preparing a move…`,
      `${trainerB?.name ?? "AI"}'s ${p2} is ready to respond…`,
      `⏳ Moves will be revealed for Round ${battle.currentRound}!`,
    ];
  }, [battle, trainerA, trainerB, pokemonA, pokemonB]);

  /* ── ALL useEffects MUST come BEFORE any conditional return ── */
  useEffect(() => {
    if (!initialBattle) return;
    if (readyCountdown <= 0) return;
    const id = setTimeout(() => setReadyCountdown((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [readyCountdown, initialBattle]);

  useEffect(() => {
    if (!battle) return;
    setLiveLines([]);
    setShowMoveDetails(false);
    pushedRef.current = { r: battle.currentRound, a: false, b: false, c: false };
  }, [battle?.currentRound]);

  useEffect(() => {
    if (!battle) return;
    if (betweenRoundsLeft !== null) return;
    if (battle.battleStatus === BattleStatus.COMPLETED) return;
    if (resultDelayLeft !== null) return;

    if (secondsLeft <= 12 && !pushedRef.current.a) {
      pushedRef.current.a = true;
      setLiveLines((p) => [...p, plannedLines[0]]);
    }
    if (secondsLeft <= 8 && !pushedRef.current.b) {
      pushedRef.current.b = true;
      setLiveLines((p) => [...p, plannedLines[1]]);
    }
    if (secondsLeft <= 3 && !pushedRef.current.c) {
      pushedRef.current.c = true;
      setShowMoveDetails(true);
      setLiveLines((p) => [...p, plannedLines[2]]);
    }
  }, [secondsLeft, battle, plannedLines, resultDelayLeft, betweenRoundsLeft]);

  useEffect(() => {
    if (!battle) return;
    if (betweenRoundsLeft !== null) return;
    if (battle.battleStatus === BattleStatus.COMPLETED) return;



 if (secondsLeft <= 0) {
      (async () => {
        try {
          const response = await advanceBattle(battle);
          setBattle(response.battle);

          if (response.result) {
            finalPayloadRef.current = response;
            saveBattleHistory({
              battle: response.battle,
              result: response.result,
              story: response.story ?? null,
            }).catch((err) => console.warn("History save failed:", err));
            setResultDelayLeft(5);
            return;
          }

          if (response.battle.pendingNextRound) {
            const roundJustCompleted = response.battle.currentRound;
            if (!pushedOfficialRoundRef.current[roundJustCompleted]) {
              pushedOfficialRoundRef.current[roundJustCompleted] = true;
              lastCompletedRoundRef.current = roundJustCompleted;
              const ordered = (response.battle.events ?? []).filter(
                (e) =>
                  e.roundNo === roundJustCompleted &&
                  (e.type === "MOVE_USED" || e.type === "ROUND_RESULT")
              );
              setLiveLines((prev) => [
                ...prev,
                ...ordered.map((e) => e.text ?? JSON.stringify(e)),
              ]);
            }
            setBetweenRoundsLeft(5);
            return;
          }

          setSecondsLeft(response.battle.roundDurationSec ?? 15);
        } catch (err) {
          console.error(err);
          alert("Failed to advance battle");
        }
      })();
      return;
    }

    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, battle, betweenRoundsLeft]);

  useEffect(() => {
    if (betweenRoundsLeft === null) return;
    if (!battle) return;

    if (betweenRoundsLeft === 3) {
      setLiveLines((p) => [
        ...p,
        `⏳ Round ${battle.nextRoundNo} will start in a moment…`,
      ]);
    }

    if (betweenRoundsLeft <= 0) {
      (async () => {
        try {
          const res = await startNextRound(battle);
          setBattle(res.battle);
          setSecondsLeft(res.battle.roundDurationSec ?? 15);
          setBetweenRoundsLeft(null);
        } catch (e) {
          console.error(e);
          alert("Failed to start next round");
        }
      })();
      return;
    }

    const id = setTimeout(() => setBetweenRoundsLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [betweenRoundsLeft, battle]);

  useEffect(() => {
    if (resultDelayLeft === null) return;
    if (resultDelayLeft <= 0) {
      navigate("/result", { state: finalPayloadRef.current, replace: true });
      return;
    }
    const id = setTimeout(() => setResultDelayLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [resultDelayLeft, navigate]);

  /* ═══════ CONDITIONAL RETURNS (after all hooks) ═══════ */

  /* ═══════ GUARD: No battle data ═══════ */
if (!initialBattle) {
  return (
    <div style={{ padding: 20, color: "#3a2e5c", fontFamily: "'Merriweather', serif" }}>
      <h2>Battle not initialized</h2>
      <p>Please start a battle from the Selection page.</p>
      <button onClick={() => navigate("/selection")}>Go to Selection</button>
    </div>
  );
}



/* ═══════ GUARD: Battle already completed (back button / stale state) ═══════ */

if (initialBattle.battleStatus === "COMPLETED") {
  return (
    <div className="battle-arena" style={{ textAlign: "center", paddingTop: 60 }}>
      <div className="trainer-card" style={{ padding: 40 }}>
        <h2 className="trainer-name">⚔️ Battle Already Completed</h2>
        <p className="muted" style={{ marginTop: 12 }}>
          This battle has ended. Start a new one!
        </p>
        <button
          className="timer-pill"
          style={{ cursor: "pointer", marginTop: 20, fontSize: 16, padding: "12px 32px" }}
          onClick={() => navigate("/selection", { replace: true })}
        >
          🎮 Go to Selection
        </button>
      </div>
    </div>
  );
}

  if (readyCountdown > 0) {
    return (
      <div className="battle-arena" style={{ textAlign: "center" }}>
        <div className="trainer-card" style={{ padding: 40 }}>
          <h2 className="trainer-name" style={{ fontSize: 32 }}>⚔️ Ready for Battle?</h2>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, margin: "28px 0" }}>
            <div style={{ textAlign: "center" }}>
              {pokemonA?.image && (
                <img src={pokemonA.image} alt={pokemonA.name} style={{ width: 80, height: 80, objectFit: "contain" }} />
              )}
              <div style={{ color: "#e0e0e0", marginTop: 6 }}>{pokemonA?.name}</div>
              <div style={{ color: "#aaa", fontSize: 12 }}>{trainerA?.name}</div>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#f5c842" }}>VS</span>
            <div style={{ textAlign: "center" }}>
              {pokemonB?.image && (
                <img src={pokemonB.image} alt={pokemonB.name} style={{ width: 80, height: 80, objectFit: "contain" }} />
              )}
              <div style={{ color: "#e0e0e0", marginTop: 6 }}>{pokemonB?.name}</div>
              <div style={{ color: "#aaa", fontSize: 12 }}>{trainerB?.name} (AI)</div>
            </div>
          </div>

          <div style={{ fontSize: 64, fontWeight: 800, color: "#00d9ff", fontFamily: "'Rajdhani', sans-serif", margin: "20px 0" }}>
            {readyCountdown}
          </div>
          <p style={{ color: "#6dbf9e", fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>
            ⚡ Battle starting in {readyCountdown} seconds...
          </p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return <h2 style={{ padding: 20, color: "#3a2e5c", fontFamily: "'Merriweather', serif" }}>Loading battle…</h2>;
  }

  /* ═══════ MAIN BATTLE SCREEN ═══════ */

  const hpA = battle.hp?.[battle.trainerAId] ?? 5;
  const hpB = battle.hp?.[battle.trainerBId] ?? 5;

  function roundClass(status) {
    if (status === "IN_PROGRESS") return "round-row in-progress";
    if (status === "COMPLETED" || status === "DONE") return "round-row completed";
    return "round-row";
  }

  return (
    <div className="battle-arena">

      {/* ── ROUND SUMMARY ── */}
      <div className="round-summary">
        <h3>Round Summary</h3>
        <div className="round-rows">
          {battle.rounds.map((r) => (
            <div key={r.roundNo} className={roundClass(r.status)}>
              Round {r.roundNo}: <strong>{r.status}</strong>
            </div>
          ))}
          <div className="timer-pill">
            ⏱ {secondsLeft}s
            {betweenRoundsLeft !== null && ` · Next in ${betweenRoundsLeft}s`}
          </div>
        </div>
      </div>

      {/* ── TRAINER PANELS ── */}
      <div className="battle-panels">
        {/* TRAINER A */}
        <div className="trainer-card">
          <div className="trainer-name">{trainerA?.name}</div>
          <div className="pokemon-image">
            {pokemonA?.image && (
              <img src={pokemonA.image} alt={pokemonA.name} />
            )}
          </div>
          <div className="hp-box">HP: {hpA} / 5</div>
          <div className="move-box">
            {showMoveDetails && battle.roundMeta ? (
              <>
                <strong>{pokemonA?.name} chose:</strong>
                {battle.roundMeta.p1Move} ({(battle.roundMeta.p1WinProb * 100).toFixed(0)}% win)
              </>
            ) : (
              "Move phase in progress…"
            )}
          </div>
        </div>

        {/* TRAINER B */}
        <div className="trainer-card">
          <div className="trainer-name">{trainerB?.name} (AI)</div>
          <div className="pokemon-image">
            {pokemonB?.image && (
              <img src={pokemonB.image} alt={pokemonB.name} />
            )}
          </div>
          <div className="hp-box">HP: {hpB} / 5</div>
          <div className="move-box">
            {showMoveDetails && battle.roundMeta ? (
              <>
                <strong>{pokemonB?.name} defended with:</strong>
                {battle.roundMeta.p2Move} ({(battle.roundMeta.p2WinProb * 100).toFixed(0)}% win)
                <em style={{ display: "block", marginTop: 4 }}>
                  {battle.roundMeta.reason}
                </em>
              </>
            ) : (
              "Reacting to opponent…"
            )}
          </div>
        </div>
      </div>

      {/* ── COMMENTARY ── */}
      <div className="commentary-section">
        <h3>Battle Commentary</h3>
        {liveLines.length === 0 ? (
          <p className="muted">(Battle is unfolding…)</p>
        ) : (
          <ul>
            {liveLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ── RESULT CTA ── */}
      {resultDelayLeft !== null && (
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <p style={{
            color: "#6dbf9e",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "1px",
          }}>
            ✅ Battle completed! Redirecting in <strong>{resultDelayLeft}s</strong>
          </p>
          <button
            onClick={() => navigate("/result", { state: finalPayloadRef.current, replace: true })}
            style={{
              marginTop: 10,
              padding: "11px 30px",
              background: "linear-gradient(135deg, #c9b8ef, #f4a7c3)",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "#3a2e5c",
              boxShadow: "0 4px 14px rgba(167,139,218,0.30)",
            }}
          >
            Go to Result →
          </button>
        </div>
      )}
    </div>
  );
}