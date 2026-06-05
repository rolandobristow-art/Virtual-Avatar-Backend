import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const speech = await openai.audio.speech.create({
  model: "tts-1",
  voice: "nova",
  input: text,
  response_format: "pcm",
});

    const buffer = Buffer.from(await speech.arrayBuffer());

    res.setHeader("Content-Type", "audio/pcm");
    res.send(buffer);

  } catch (error) {
    console.error("TTS ERROR:", error);

    res.status(500).json({
      error: "Failed to generate speech",
    });
  }
});

export default router;