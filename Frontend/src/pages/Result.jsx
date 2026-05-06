

import "./battle.css"; // ✅ FIX: Import battle styles
import { useLocation, useNavigate } from "react-router-dom";
import { trainers } from "../data/mock/trainers";
import { pokemons } from "../data/mock/pokemons";
import { useEffect, useState } from "react";
import { fetchBattleHistory } from "../services/api";

function getPokemon(id) {
  return pokemons.find((p) => p.id === id) || { name: id, image: "" };
}

function getTrainerName(id) {
  if (id === "DRAW") return "DRAW";
  return trainers.find((t) => t.id === id)?.name ?? id;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const battle = location.state?.battle ?? null;
  const result = location.state?.result ?? null;
  const story = location.state?.story ?? null;

  const [recentHistory, setRecentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  /* ── Always fetch recent matches from MongoDB ── */
  useEffect(() => {
    fetchBattleHistory()
      .then((data) => {
        setRecentHistory(Array.isArray(data) ? data.slice(0, 5) : []);
        setLoadingHistory(false);
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setLoadingHistory(false);
      });
  }, []);

  /* ── Derived values (only when result exists) ── */
  const isDraw = result?.winnerTrainerId === "DRAW";
  let pokemonA = null;
  let pokemonB = null;
  let winnerPokemon = null;
  let winnerTrainerName = null;

  if (result && battle) {
    pokemonA = getPokemon(battle.pokemonAId);
    pokemonB = getPokemon(battle.pokemonBId);

    if (isDraw) {
      winnerPokemon = null; // ✅ No winner pokemon for DRAW
      winnerTrainerName = "DRAW";
    } else {
      winnerPokemon =
        result.winnerTrainerId === battle.trainerAId ? pokemonA : pokemonB;
      winnerTrainerName = getTrainerName(result.winnerTrainerId);
    }
  }

  return (
    <div className="battle-arena">
      {/* ═══════ RESULT CARD ═══════ */}
        {result && battle ? (
          <div className="trainer-card">
            <h2 className="trainer-name">🏆 Battle Result</h2>

            {/* ── Battle Number ── */}
            <div style={s.infoRow}>
              <span style={s.label}>Battle #</span>
              <span style={s.mono}>{battle.battleId ?? "—"}</span>
            </div>

            {/* ── Pokémon Matchup ── */}
            <div style={s.matchup}>
              <div style={s.pokeCard}>
                {pokemonA?.image && (
                  <img src={pokemonA.image} alt={pokemonA.name} style={s.pokeImg} />
                )}
                <span>{pokemonA?.name}</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {getTrainerName(battle.trainerAId)}
                </span>
              </div>
              <span style={s.vsText}>VS</span>
              <div style={s.pokeCard}>
                {pokemonB?.image && (
                  <img src={pokemonB.image} alt={pokemonB.name} style={s.pokeImg} />
                )}
                <span>{pokemonB?.name}</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {getTrainerName(battle.trainerBId)}
                </span>
              </div>
            </div>

            {/* ── Winner Section (DRAW-aware) ── */}
            {isDraw ? (
              <div style={{ ...s.winnerBox, borderColor: "#f5c842" }}>
                <div style={{ textAlign: "center", width: "100%" }}>
                  <div style={s.winnerLabel}>🤝 RESULT</div>
                  <div style={{ ...s.winnerName, color: "#f5c842", fontSize: 28 }}>
                    DRAW
                  </div>
                  <div style={s.winnerPoke}>No winner this time!</div>
                </div>
              </div>
            ) : (
              <div style={s.winnerBox}>
                {winnerPokemon?.image && (
                  <img
                    src={winnerPokemon.image}
                    alt={winnerPokemon.name}
                    style={s.winnerImg}
                  />
                )}
                <div>
                  <div style={s.winnerLabel}>🏆 WINNER</div>
                  <div style={s.winnerName}>{winnerTrainerName}</div>
                  <div style={s.winnerPoke}>with {winnerPokemon?.name}</div>
                </div>
              </div>
            )}

            {/* ── Score ── */}
            <div className="move-box">
              <strong>Score</strong>
              <span style={{ fontSize: 22, color: "#f5c842", fontWeight: 700 }}>
                {result.score ?? 0}
              </span>
            </div>

            {/* ── Round Breakdown ── */}
            {result.breakdown && (
              <div className="move-box">
                <strong>Round Breakdown</strong>
                <div style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: 8,
                  fontSize: 14,
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#00d9ff", fontSize: 20, fontWeight: 700 }}>
                      {result.breakdown.aWins}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 11 }}>
                      {getTrainerName(battle.trainerAId)} Wins
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#f5c842", fontSize: 20, fontWeight: 700 }}>
                      {result.breakdown.draws}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 11 }}>Draws</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#ec4899", fontSize: 20, fontWeight: 700 }}>
                      {result.breakdown.bWins}
                    </div>
                    <div style={{ color: "#aaa", fontSize: 11 }}>
                      {getTrainerName(battle.trainerBId)} Wins
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quick Summary Table ── */}
            <div className="move-box">
              <strong>Battle Summary</strong>
              <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={summaryTd}>Battle #</td>
                    <td style={{ ...summaryTd, color: "#00d9ff", fontFamily: "monospace" }}>
                      {battle.battleId ? battle.battleId.slice(0, 12) + "…" : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryTd}>Winner Trainer</td>
                    <td style={{ ...summaryTd, color: isDraw ? "#f5c842" : "#00d9ff", fontWeight: 700 }}>
                      {isDraw ? "🤝 DRAW" : `🏆 ${winnerTrainerName}`}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryTd}>Winner Pokémon</td>
                    <td style={summaryTd}>
                      {isDraw ? (
                        <span style={{ color: "#f5c842" }}>— None (Draw) —</span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {winnerPokemon?.image && (
                            <img
                              src={winnerPokemon.image}
                              alt={winnerPokemon.name}
                              style={{ width: 28, height: 28, objectFit: "contain" }}
                            />
                          )}
                          <span style={{ color: "#00d9ff", fontWeight: 600 }}>
                            {winnerPokemon?.name}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryTd}>Score</td>
                    <td style={{ ...summaryTd, color: "#f5c842", fontWeight: 700, fontSize: 16 }}>
                      {result.score ?? 0}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryTd}>Rounds</td>
                    <td style={summaryTd}>
                      {result.breakdown
                        ? `Player ${result.breakdown.aWins} – ${result.breakdown.draws} – ${result.breakdown.bWins} AI`
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── AI Story ── */}
            {story && (
              <div className="move-box">
                <strong>📖 {story.title}</strong>
                <p className="muted">{story.summary}</p>
              </div>
            )}
          </div>
        ) : (
          /* ── No battle data fallback ── */
          <div className="trainer-card">
            <h2 className="trainer-name">Result Screen</h2>
            <p className="muted">
              ⚠️ No current battle result. Check recent matches below!
            </p>
          </div>
        )}




{/* ═══════ RECENT MATCHES — ALWAYS VISIBLE ═══════ */}
      <div className="commentary-section" style={{ marginTop: 20 }}>
        <h3>📋 Recent Matches</h3>
        {loadingHistory ? (
          <p className="muted">Loading recent matches...</p>
        ) : recentHistory.length === 0 ? (
          <p className="muted">
            🎮 No battles played yet! Go pick your Pokémon and fight!
          </p>
        ) : (
          <table style={t.table}>
            <thead>
              <tr>
                <th style={t.th}>#</th>
                <th style={t.th}>Trainer A</th>
                <th style={t.th}>Pokémon A</th>
                <th style={t.th}>Trainer B</th>
                <th style={t.th}>Pokémon B</th>
                <th style={t.th}>🏆 Winner</th>
                <th style={t.th}>Score</th>
                <th style={t.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((h, i) => {
                const pA = getPokemon(h.pokemonAId);
                const pB = getPokemon(h.pokemonBId);
                const hIsDraw = h.winnerTrainerId === "DRAW";

                return (
                  <tr key={h._id || i}>
                    <td style={t.td}>{i + 1}</td>
                    <td style={t.td}>
                      {getTrainerName(h.trainerAId)}
                    </td>
                    <td style={t.td}>
                      <div style={t.pokeCell}>
                        {pA.image && (
                          <img
                            src={pA.image}
                            alt={pA.name}
                            style={t.pokeImgSmall}
                          />
                        )}
                        <span>{pA.name}</span>
                      </div>
                    </td>
                    <td style={t.td}>
                      {getTrainerName(h.trainerBId)}
                    </td>
                    <td style={t.td}>
                      <div style={t.pokeCell}>
                        {pB.image && (
                          <img
                            src={pB.image}
                            alt={pB.name}
                            style={t.pokeImgSmall}
                          />
                        )}
                        <span>{pB.name}</span>
                      </div>
                    </td>
                    <td style={t.td}>
                      {hIsDraw ? (
                        <span
                          style={{
                            color: "#f5c842",
                            fontWeight: 600,
                          }}
                        >
                          🤝 DRAW
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#00d9ff",
                            fontWeight: 600,
                          }}
                        >
                          🏆{" "}
                          {getTrainerName(h.winnerTrainerId)}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        ...t.td,
                        color: "#f5c842",
                        fontWeight: 600,
                      }}
                    >
                      {h.score ?? 0}
                    </td>
                    <td style={t.td}>
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          className="timer-pill"
          style={{
            cursor: "pointer",
            fontSize: 13,
            padding: "8px 20px",
          }}
          onClick={() => navigate("/battle/history")}
        >
          Show More →
        </button>
      </div>

      {/* ═══════ ACTIONS ═══════ */}
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <button
          className="timer-pill"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/selection")}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}

/* ── Result Info Styles ── */
const s = {
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "rgba(0,217,255,0.08)",
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#00d9ff",
    wordBreak: "break-all",
  },
  trainerRow: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    margin: "16px 0",
  },
  trainerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    padding: "4px 16px",
    borderRadius: 14,
    backgroundColor: "#5b2e91",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
  },
  vsIcon: { fontSize: 18, color: "#f5c842", fontWeight: 700 },
  matchup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    margin: "16px 0",
  },
 pokeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    color: "#e0e0e0",
    fontSize: 14,
  },
  pokeImg: {
    width: 64,
    height: 64,
    objectFit: "contain",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 4,
  },
  vsText: { fontSize: 20, fontWeight: 700, color: "#f5c842" },
  winnerBox: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    margin: "16px 0",
    backgroundColor: "rgba(0,217,255,0.1)",
    borderRadius: 12,
    border: "1px solid #00d9ff",
  },
  winnerImg: {
    width: 72,
    height: 72,
    objectFit: "contain",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 4,
  },
  winnerLabel: {
    fontSize: 11,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  winnerName: { fontSize: 22, fontWeight: 700, color: "#00d9ff" },
  winnerPoke: { fontSize: 14, color: "#ccc", fontStyle: "italic" },
};

/* ── Mini Table Styles ── */
const t = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#2d2a4a",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 12,
  },
  th: {
    padding: "8px 12px",
    backgroundColor: "#3a3556",
    color: "#00d9ff",
    textAlign: "left",
    fontSize: 12,
    borderBottom: "2px solid #00d9ff",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #3a3556",
    color: "#e0e0e0",
    fontSize: 13,
  },
  pokeCell: { display: "flex", alignItems: "center", gap: 6 },
  pokeImgSmall: {
    width: 28,
    height: 28,
    objectFit: "contain",
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
};
    /* ── Summary Table Cell Style ── */    // ✅ ADD HERE
    const summaryTd = {
      padding: "8px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      color: "#e0e0e0",
      fontSize: 13,
      verticalAlign: "middle",

};