import express from "express";

const router = express.Router();

router.get("/token", async (req, res) => {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.HEYGEN_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const rawText = await response.text();
    console.log("HeyGen token status:", response.status);
    console.log("HeyGen token response:", rawText);

    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to get HeyGen token",
        details: data
      });
    }

    return res.json({
      token: data.data?.token || data.token
    });
  } catch (error) {
    console.error("Token route error:", error);
    return res.status(500).json({
      error: "Could not connect to HeyGen",
      details: error.message
    });
  }
});

export default router;