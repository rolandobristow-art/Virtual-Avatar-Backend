import express from 'express';
import { saveLead } from '../service/leadService.js';
import { sendLeadNotification } from '../services/emailService.js';   // ← Import your email service

const router = express.Router();

router.post('/api/lead', async (req, res) => {
  try {
    const lead = await saveLead(req.body);

    if (!lead) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to save lead" 
      });
    }

    // === Send Email Notification ===
    try {
      await sendLeadNotification(lead);
      console.log(`📧 Email notification sent for lead: ${lead.name}`);
    } catch (emailError) {
      console.warn("⚠️ Lead saved, but email notification failed:", emailError.message);
      // We still return success because the lead was saved
    }

    res.status(200).json({ 
      success: true, 
      message: "Lead received successfully",
      lead 
    });

  } catch (error) {
    console.error("❌ Lead route error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

export default router;