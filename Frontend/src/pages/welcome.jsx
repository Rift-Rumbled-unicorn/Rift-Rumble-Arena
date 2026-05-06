import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="battle-arena">
      <div className="trainer-card">
        <h2 className="trainer-name">Welcome to Rift‑Rumble Arena</h2>

        <p className="muted" style={{ marginTop: 12, textAlign: "center" }}>
          Choose your Pokémon and fight a 3‑round battle against an AI opponent.
          Each round runs for 15 seconds. Win more rounds to win the battle!
        </p>

        <button
          className="timer-pill"
          style={{ alignSelf: "center", marginTop: 20, cursor: "pointer" }}
          onClick={() => navigate("/selection")}
        >
          Let’s Go to Selection
        </button>
      </div>
    </div>
  );
}
