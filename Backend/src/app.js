import express from "express";
import cors from "cors";

import dotenv from "dotenv";

import battleRoutes from "./routes/battleRoutes.js";
import mongoose from "mongoose";

import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "https://rift-rumble-arena-joy3sui1z-rift-rumbled-unicorns-projects.vercel.app"
}));
app.use(express.json());


// ✅ Routes
app.get("/health", (req, res) => {
  res.json({ status: "backend running ✅" });
});

app.use("/battle", battleRoutes);
app.use("/history", historyRoutes);

const PORT = process.env.PORT  || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });


