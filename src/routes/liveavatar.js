import express from "express";

const router = express.Router();

router.get("/embed", async (req, res) => {
  try {
    const response = await fetch("https://api.liveavatar.com/v2/embeddings", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        avatar_id: "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0",
        context_id: "158f5d55-2d4f-11f1-8d28-066a7fa2e369",
        is_sandbox: true
      })
    });

    const rawText = await response.text();
    console.log("LiveAvatar status:", response.status);
    console.log("LiveAvatar response:", rawText);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { raw: rawText };
    }

    return res.status(response.status).json(parsed);
  } catch (error) {
    console.error("LiveAvatar embed error:", error);
    return res.status(500).json({
      error: "Failed to reach LiveAvatar",
      details: error.message
    });
  }
});

export default router;