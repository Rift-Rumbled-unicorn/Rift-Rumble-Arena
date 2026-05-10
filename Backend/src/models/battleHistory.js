import mongoose from "mongoose";

const battleHistorySchema = new mongoose.Schema(
  {
    battleId:   { type: String, required: true, unique: true },

    trainerAId: { type: String, required: true, default: "t1" },
    trainerBId: { type: String, required: true, default: "t2" },

    pokemonAId: { type: String, required: true, default: "unknown" },
    pokemonBId: { type: String, required: true, default: "unknown" },

    // ✅ Now supports: "t1" | "t2" | "DRAW"
    winnerTrainerId: {
      type: String,
      enum: ["t1", "t2", "DRAW", "unknown"],
      default: "unknown",
    },

    // ✅ Make score numeric (your buildResult returns 300 etc.)
    score: { type: Number, default: 0 },

    // ✅ Optional but very helpful for UI
    breakdown: {
      aWins: { type: Number, default: 0 },
      bWins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
    },

    rounds: { type: Array, default: [] },
    events: { type: Array, default: [] },

    // can be string or array or object (your storyteller)
    story: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("BattleHistory", battleHistorySchema);