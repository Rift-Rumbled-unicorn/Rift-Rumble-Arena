import "./battle.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBattleHistory } from "../services/api";
import { pokemons } from "../data/mock/pokemons";
import { trainers } from "../data/mock/trainers";

function getPokemon(id) {
  return pokemons.find((p) => p.id === id) || { name: id, image: "" };
}

function getTrainerName(id) {
  if (id === "DRAW") return "DRAW";
  return trainers.find((t) => t.id === id)?.name ?? id;
}

export default function BattleLanding() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBattleHistory()
      .then((data) => {
        setHistory(Array.isArray(data) ? data.slice(0, 5) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load battle history");
        setLoading(false);
      });
  }, []);

  return (
    <div className="battle-arena">
      {/* HEADER */}
      <div className="trainer-card" style={{ textAlign: "center" }}>
        <h2 className="trainer-name">⚔️ Battle Arena</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          View your recent battles or start a new one!
        </p>
        <button
          className="timer-pill"
          style={{
            cursor: "pointer",
            marginTop: 16,
            fontSize: 16,
            padding: "12px 32px",
          }}
          onClick={() => navigate("/selection")}
        >
          🎮 Start New Battle
        </button>
      </div>

      {/* LAST 5 BATTLES — CARD STYLE */}
      <div className="commentary-section" style={{ marginTop: 24 }}>
        <h3>📋 Recent Battles</h3>

        {loading ? (
          <p className="muted">⏳ Loading battles...</p>
        ) : error ? (
          <p className="muted">❌ {error}</p>
        ) : history.length === 0 ? (
          <p className="muted">
            🎮 No battles yet! Go to Selection and pick your Pokémon!
          </p>
        ) : (
          <div style={c.cardList}>
            {history.map((h, i) => {
              const pA = getPokemon(h.pokemonAId);
              const pB = getPokemon(h.pokemonBId);
              const isDraw = h.winnerTrainerId === "DRAW";
              const winnerPoke = isDraw
                ? null
                : h.winnerTrainerId === h.trainerAId
                  ? pA
                  : pB;

              return (
                <div key={h._id || i} style={c.card}>
                  {/* ── Top Row: Battle # + Date ── */}
                  <div style={c.cardHeader}>
                    <span style={c.battleNum}>
                      #{i + 1} · {h.battleId ? h.battleId.slice(0, 10) + "…" : "—"}
                    </span>
                    <span style={c.date}>
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>

                  {/* ── Middle: Pokemon A vs Pokemon B ── */}
                  <div style={c.matchRow}>
                    {/* Pokemon A */}
                    <div style={c.pokeSide}>
                      {pA.image && (
                        <img src={pA.image} alt={pA.name} style={c.pokeImg} />
                      )}
                      <span style={c.pokeName}>{pA.name}</span>
                      <span style={c.trainerTag}>
                        {getTrainerName(h.trainerAId)}
                      </span>
                    </div>

                    {/* VS / Result */}
                    <div style={c.vsColumn}>
                      <span style={c.vsText}>VS</span>
                    </div>

                    {/* Pokemon B */}
                    <div style={c.pokeSide}>
                      {pB.image && (
                        <img src={pB.image} alt={pB.name} style={c.pokeImg} />
                      )}
                      <span style={c.pokeName}>{pB.name}</span>
                      <span style={c.trainerTag}>
                        {getTrainerName(h.trainerBId)}
                      </span>
                    </div>
                  </div>

                  {/* ── Winner Row ── */}
                  <div style={c.winnerRow}>
                    {isDraw ? (
                      <span style={c.drawBadge}>🤝 DRAW</span>
                    ) : (
                      <div style={c.winnerInfo}>
                        {winnerPoke?.image && (
                          <img
                            src={winnerPoke.image}
                            alt={winnerPoke.name}
                            style={c.winnerImg}
                          />
                        )}
                        <div>
                          <span style={c.winnerLabel}>🏆 Winner</span>
                          <span style={c.winnerName}>
                            {getTrainerName(h.winnerTrainerId)}
                          </span>
                          <span style={c.winnerPoke}>
                            with {winnerPoke?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Bottom Row: Score + Breakdown ── */}
                  <div style={c.bottomRow}>
                    <div style={c.scorePill}>
                      ⭐ Score: <strong>{h.score ?? 0}</strong>
                    </div>
                    {h.breakdown && (
                      <div style={c.breakdownRow}>
                        <span style={{ color: "#00d9ff" }}>
                          P: {h.breakdown.aWins ?? 0}
                        </span>
                        <span style={{ color: "#f5c842" }}>
                          D: {h.breakdown.draws ?? 0}
                        </span>
                        <span style={{ color: "#ec4899" }}>
                          AI: {h.breakdown.bWins ?? 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More */}
        {history.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              className="timer-pill"
              style={{
                cursor: "pointer",
                fontSize: 13,
                padding: "8px 24px",
              }}
              onClick={() => navigate("/battle/history")}
            >
              Show More →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Card Styles ── */
const c = {
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 12,
  },
  card: {
    background: "linear-gradient(135deg, #1e293b 0%, #273449 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  battleNum: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    color: "#64748b",
  },
  matchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "12px 0",
  },
  pokeSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  pokeImg: {
    width: 56,
    height: 56,
    objectFit: "contain",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 4,
  },
  pokeName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  trainerTag: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  vsColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "0 12px",
  },
  vsText: {
    fontSize: 16,
    fontWeight: 800,
    color: "#f5c842",
    fontFamily: "'Rajdhani', sans-serif",
  },
  winnerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "10px 0",
    padding: "10px",
    backgroundColor: "rgba(0,217,255,0.06)",
    borderRadius: 10,
    border: "1px solid rgba(0,217,255,0.12)",
  },
  drawBadge: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f5c842",
    letterSpacing: 1,
  },
  winnerInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  winnerImg: {
    width: 36,
    height: 36,
    objectFit: "contain",
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 2,
  },
  winnerLabel: {
    display: "block",
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  winnerName: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#00d9ff",
  },
  winnerPoke: {
    display: "block",
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  scorePill: {
    fontSize: 13,
    color: "#f5c842",
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
  },
  breakdownRow: {
    display: "flex",
    gap: 12,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Rajdhani', sans-serif",
  },
};
