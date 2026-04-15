import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

import chatRouter from "./routes/chat.js";
import leadRouter from "./routes/lead.js";
import liveAvatarRouter from "./routes/liveavatar.js";

// Load env variables (works locally, ignored on Render but safe)
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);
app.use("/api/lead", leadRouter);
app.use("/api/liveavatar", liveAvatarRouter);

// Health check (important for Render)
app.get("/", (req, res) => {
  res.send("Virtual Avatar Backend is running");
});

// Render-compatible port
const PORT = process.env.PORT || 3000;

// IMPORTANT: bind to 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});