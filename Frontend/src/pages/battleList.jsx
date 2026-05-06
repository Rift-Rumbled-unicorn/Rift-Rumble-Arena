import "./battle.css";
import { useEffect, useState } from "react";
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

export default function BattleList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBattleHistory()
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError("Failed to load battle history");
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="muted" style={{ textAlign: "center", marginTop: 60 }}>⏳ Loading battle history...</p>;
  if (error)
    return <p style={{ textAlign: "center", marginTop: 60, color: "#ef4444" }}>❌ {error}</p>;

  return (
    <div className="battle-arena">
      <div className="round-summary" style={{ textAlign: "center" }}>
        <h3>⚔️ Full Battle History</h3>
        <p className="muted" style={{ marginTop: 4 }}>
          All {history.length} battles played so far
        </p>
      </div>

      {history.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", marginTop: 40 }}>
          🎮 No battles played yet! Go pick your Pokémon and fight!
        </p>
      ) : (
        <div style={c.cardGrid}>
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
                {/* ── Header: # + Date ── */}
                <div style={c.cardHeader}>
                  <span style={c.battleNum}>
                    #{i + 1}
                  </span>
                  <span style={c.battleId}>
                    {h.battleId ? h.battleId.slice(0, 10) + "…" : "—"}
                  </span>
                  <span style={c.date}>
                    {h.createdAt
                      ? new Date(h.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                {/* ── Matchup: A vs B ── */}
                <div style={c.matchRow}>
                  <div style={c.pokeSide}>
                    {pA.image && (
                      <img src={pA.image} alt={pA.name} style={c.pokeImg} />
                    )}
                    <span style={c.pokeName}>{pA.name}</span>
                    <span style={c.trainerTag}>
                      {getTrainerName(h.trainerAId)}
                    </span>
                  </div>

                  <span style={c.vsText}>VS</span>

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

                {/* ── Winner ── */}
                <div style={c.winnerStrip}>
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
                      <span style={c.winnerName}>
                        🏆 {getTrainerName(h.winnerTrainerId)}
                      </span>
                      <span style={c.winnerPoke}>
                        with {winnerPoke?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Score + Breakdown ── */}
                <div style={c.footer}>
                  <span style={c.scorePill}>
                    ⭐ {h.score ?? 0}
                  </span>
                  {h.breakdown ? (
                    <span style={c.breakdownText}>
                      P:{h.breakdown.aWins ?? 0} · D:{h.breakdown.draws ?? 0} · AI:{h.breakdown.bWins ?? 0}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Card Grid Styles ── */
const c = {
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
    marginTop: 16,
  },
  card: {
    background: "linear-gradient(145deg, #1e293b, #273449)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 6,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  battleNum: {
    fontSize: 13,
    fontWeight: 700,
    color: "#6366f1",
    fontFamily: "'Rajdhani', sans-serif",
  },
  battleId: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#64748b",
  },
  date: {
    fontSize: 10,
    color: "#64748b",
  },
  matchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pokeSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  pokeImg: {
    width: 48,
    height: 48,
    objectFit: "contain",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 3,
  },
  pokeName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  trainerTag: {
    fontSize: 9,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: 800,
    color: "#f5c842",
    fontFamily: "'Rajdhani', sans-serif",
    padding: "0 8px",
  },
  winnerStrip: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px 10px",
    backgroundColor: "rgba(0,217,255,0.06)",
    borderRadius: 8,
    border: "1px solid rgba(0,217,255,0.1)",
  },
  drawBadge: {
    fontSize: 14,
    fontWeight: 700,
    color: "#f5c842",
  },
  winnerInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  winnerImg: {
    width: 28,
    height: 28,
    objectFit: "contain",
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  winnerName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#00d9ff",
  },
  winnerPoke: {
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  scorePill: {
    fontSize: 13,
    fontWeight: 700,
    color: "#f5c842",
    fontFamily: "'Rajdhani', sans-serif",
  },
  breakdownText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
    letterSpacing: 0.5,
  },
};