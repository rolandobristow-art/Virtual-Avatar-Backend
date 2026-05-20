import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

// Import Routes
import chatRouter from "./routes/chat.js";
import leadRouter from "./routes/lead.js";
import liveAvatarRouter from "./routes/liveavatar.js";

// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// ====================== MIDDLEWARE ======================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ====================== STATIC FILES (FRONTEND) ======================
// Serve your separate frontend folder
app.use(express.static(path.join(__dirname, '../../frontend')));

// IMPORTANT: Fallback - serve index.html for all routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// ====================== ROUTES ======================
// API Routes
app.use("/api/chat", chatRouter);
app.use("/api/lead", leadRouter);
app.use("/api/liveavatar", liveAvatarRouter);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Virtual Avatar Backend is running smoothly");
});

// Catch-all 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend served from: ../../frontend`);
  console.log(`📍 Lead endpoint: http://localhost:${PORT}/api/lead`);
});