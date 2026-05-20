import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

// Import Routes
import chatRouter from "./routes/chat.js";
import leadRouter from "./routes/lead.js";
import liveAvatarRouter from "./routes/liveavatar.js";

// ====================== STATIC FILES (FRONTEND) ======================
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the separate frontend folder
app.use(express.static(path.join(__dirname, '../../frontend')));

// IMPORTANT: Fallback route - serve index.html for all pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});
// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// ====================== MIDDLEWARE ======================
app.use(cors());
app.use(express.json({ limit: "10mb" }));        // Increased limit for safety
app.use(express.urlencoded({ extended: true }));

// ====================== ROUTES ======================
// API Routes (using routers)
app.use("/api/chat", chatRouter);
app.use("/api/lead", leadRouter);          // ← Already correct (singular)
app.use("/api/liveavatar", liveAvatarRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Virtual Avatar Backend is running smoothly");
});

// Optional: Catch-all for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ====================== SERVER START ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Lead endpoint ready at: http://localhost:${PORT}/api/lead`);
});