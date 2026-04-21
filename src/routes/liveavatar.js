import express from "express";

const router = express.Router();

// Get HeyGen streaming session token
router.get("/token", async (req, res) => {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.HEYGEN_API_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("HeyGen token error:", data);
      return res.status(500).json({
        error: "Failed to get HeyGen token"
      });
    }

    return res.json({
      token: data.data.token
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