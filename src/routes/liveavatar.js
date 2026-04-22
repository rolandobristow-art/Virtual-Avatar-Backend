import express from "express";

const router = express.Router();

const LIVEAVATAR_CONFIG = {
  mode: "FULL",
  avatar_id: "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0",
  avatar_persona: {
    voice_id: "4f3b1e99-b580-4f05-9b67-a5f585be0232",
    context_id: "158f5d55-2d4f-11f1-8d28-066a7fa2e369",
    language: "en"
  }
};

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

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Could not connect to LiveAvatar",
      details: error.message
    });
  }
});

router.post("/start", async (req, res) => {
  try {
    const { session_id, session_token } = req.body;

    if (!session_id || !session_token) {
      return res.status(400).json({
        error: "session_id and session_token are required."
      });
    }

    const response = await fetch("https://api.liveavatar.com/v1/sessions/start", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id,
        session_token
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to start LiveAvatar session",
        details: data
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Could not start LiveAvatar session",
      details: error.message
    });
  }
});

export default router;