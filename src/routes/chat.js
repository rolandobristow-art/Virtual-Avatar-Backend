import express from "express";
import { getChatResponse } from "../services/openaiService.js";
import { getSession } from "../store/sessionStore.js";
import { saveLead } from "../services/leadService.js";
import { sendLeadEmail } from "../services/emailService.js";

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
    const { message, history = [], sessionId } = req.body;

    if (!message?.trim() || !sessionId) {
      return res.status(400).json({ error: "message and sessionId are required." });
    }

    const session = getSession(sessionId);
    const cleanMessage = message.trim();

   
    // ====================== QUALIFICATION FLOW ======================
    if (isQualificationActive(session)) {
      const result = handleQualificationReply(session, cleanMessage);

      if (typeof result === "string") {
        return res.json({ reply: result, mode: "qualification" });
      }
// Qualification completed → Save lead + Send email
      if (result?.done) {
        console.log("🔥 Qualification DONE - attempting to save lead");

        const savedLead = await saveLead(result.answers);

        console.log("🔥 saveLead returned:", savedLead);

        return res.json({
          reply: "Thank you! Your details have been received.",
          mode: "qualification_complete",
          lead: savedLead
        });
      }
    }
    
    // ====================== QUALIFICATION INVITE RESPONSE ======================
    if (isQualificationInvited(session)) {
      if (isYesResponse(cleanMessage)) {
        const firstQuestion = startQualificationFlow(session);
        return res.json({ reply: firstQuestion, mode: "qualification" });
      }

      if (isNoResponse(cleanMessage)) {
        clearQualificationInvite(session);
        return res.json({
          reply: "No problem at all. I'm happy to answer any questions you have.",
          mode: "chat",
        });
      }
    }

    // ====================== NORMAL CHAT ======================
    const reply = await getChatResponse({ message: cleanMessage, history });

    if (shouldOfferQualification(cleanMessage)) {
      markQualificationInvited(session);

      const finalReply = reply.includes("few quick questions")
        ? reply
        : `${reply}\n\nI can show you exactly how this would work for your business — it’ll just take a few quick questions.`;

      return res.json({ reply: finalReply, mode: "invite_qualification" });
    }

    return res.json({ reply, mode: "chat" });

  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({
      error: "Something went wrong.",
      reply: "Sorry, I had a technical issue. Please try again.",
    });
  }
});

export default router;