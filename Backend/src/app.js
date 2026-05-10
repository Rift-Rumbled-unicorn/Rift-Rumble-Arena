import express from "express";
import cors from "cors";

import battleRoutes from "./routes/battleRoutes.js";
import mongoose from "mongoose";

import historyRoutes from "./routes/historyRoutes.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());


// ✅ Routes
app.get("/health", (req, res) => {
  res.json({ status: "backend running ✅" });
});

app.use("/battle", battleRoutes);
app.use("/history", historyRoutes);

const PORT = 4000;

mongoose
  .connect("mongodb://127.0.0.1:27017/riftRumbleArena")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });


