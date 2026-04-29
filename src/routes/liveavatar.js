import express from "express";

const router = express.Router();

// ✅ Correct configuration with your chosen Context / Persona
const LIVEAVATAR_CONFIG = {
  mode: "LITE",
  avatar_id: "073b60a9-89a8-45aa-8902-c358f64d2852",     // Visual avatar
  avatar_persona: {
    voice_id: "254ffe1e-c89f-430f-8c36-9e7611d310c0",
    context_id: "47ed694b-95b3-401f-818e-493558588eae",   // ← Your chosen persona/context
    language: "en"
  }
};

// ====================== TOKEN ROUTE ======================
router.get("/token", async (req, res) => {
  try {
    const response = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(LIVEAVATAR_CONFIG)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to get LiveAvatar token",
        details: data
      });
    }

    return res.json({
      code: 1000,
      data: data.data || data,
      message: "Session token created successfully"
    });

  } catch (error) {
    console.error("LiveAvatar error:", error);
    return res.status(500).json({
      error: "Could not connect to LiveAvatar",
      details: error.message
    });
  }
});

export default router;