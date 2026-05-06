import express from "express";

const router = express.Router();

const LIVEAVATAR_CONFIG = {
  mode: "FULL",
  avatar_id: "073b60a9-89a8-45aa-8902-c358f64d2852",
  avatar_persona: {
    voice_id: "254ffe1e-c89f-430f-8c36-9e7611d310c0",
    context_id: "47ed694b-95b3-401f-818e-493558588eae",
    language: "en"
  }
};

router.get("/token", async (req, res) => {
  try {
    console.log("LIVEAVATAR_API_KEY length:", process.env.LIVEAVATAR_API_KEY ? process.env.LIVEAVATAR_API_KEY.length : "MISSING");
    console.log("LIVEAVATAR_API_KEY starts with:", process.env.LIVEAVATAR_API_KEY ? process.env.LIVEAVATAR_API_KEY.substring(0, 20) : "MISSING");

    if (!process.env.LIVEAVATAR_API_KEY) {
      return res.status(500).json({ error: "LIVEAVATAR_API_KEY is missing in environment" });
    }

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
        error: "LiveAvatar token failed",
        details: data
      });
    }

    return res.json({
      code: 1000,
      data: data,
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