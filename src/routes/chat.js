import express from "express";
import { getChatResponse } from "../services/openaiService.js";
import { getSession } from "../store/sessionStore.js";
import {
  shouldOfferQualification,
  startQualificationFlow,
  markQualificationInvited,
  clearQualificationInvite,
  isQualificationActive,
  isQualificationInvited,
  isYesResponse,
  isNoResponse,
  handleQualificationReply,
} from "../services/qualificationService.js";


const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Chat route hit. Body:", req.body);

    const { message, history = [], sessionId } = req.body;

    if (!message || typeof message !== "string" || !sessionId) {
      return res.status(400).json({
        error: "message and sessionId are required.",
      });
    }

    const session = getSession(sessionId);

    if (isQualificationActive(session)) {
      const result = handleQualificationReply(session, message);

      if (typeof result === "string") {
        return res.json({
          reply: result,
          mode: "qualification",
        });
      }

      if (result?.done) {
        const savedLead = saveLead(result.answers);

        console.log("Lead saved:", savedLead);

        return res.json({
          reply: result.message,
          mode: "qualification_complete",
          lead: savedLead,
        });
      }
    }

    if (isQualificationInvited(session)) {
      if (isYesResponse(message)) {
        const firstQuestion = startQualificationFlow(session);

        return res.json({
          reply: firstQuestion,
          mode: "qualification",
        });
      }

      if (isNoResponse(message)) {
        clearQualificationInvite(session);

        return res.json({
          reply:
            "No problem. I’m happy to answer any questions about how Virtual Avatar works, where it fits on a website, or what kind of results it can help support.",
          mode: "chat",
        });
      }
    }

    const reply = await getChatResponse({ message, history });

   if (shouldOfferQualification(message)) {
  markQualificationInvited(session);

  const alreadyInviting =
    reply.toLowerCase().includes("map out") ||
    reply.toLowerCase().includes("few quick questions");

  const finalReply = alreadyInviting
    ? reply
    : `${reply}\n\nThe real value comes from setting this up around your business and how your website converts.\n\nI can map out exactly how this would work for your business — it’ll just take a few quick questions.`;

  return res.json({
    reply: finalReply,
    mode: "invite_qualification",
  });
}

    return res.json({
      reply,
      mode: "chat",
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({
      error: error.message || "Server error while processing chat request.",
    });
  }
});

export default router;