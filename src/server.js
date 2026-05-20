import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

// Import Routes
import chatRouter from "./routes/chat.js";
import leadRouter from "./routes/lead.js";
import liveAvatarRouter from "./routes/liveavatar.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ====================== STATIC FILES (PUBLIC FOLDER) ======================
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ====================== API ROUTES ======================
app.use("/api/chat", chatRouter);
app.use("/api/lead", leadRouter);
app.use("/api/liveavatar", liveAvatarRouter);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is running - Public folder active");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, '../public')}`);
});