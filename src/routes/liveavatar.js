import express from "express";

const router = express.Router();

router.get("/token", async (req, res) => {
  try {
    const response = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const rawText = await response.text();
    console.log("LiveAvatar token status:", response.status);
    console.log("LiveAvatar token response:", rawText);

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to get LiveAvatar token",
        details: data
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("LiveAvatar token route error:", error);
    return res.status(500).json({
      error: "Could not connect to LiveAvatar",
      details: error.message
    });
  }
});

export default router;