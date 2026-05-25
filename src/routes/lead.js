import express from 'express';
import { saveLead } from '../services/leadService.js';        // ← Correct (plural + one level up)
import { sendLeadEmail } from '../services/emailService.js';  // ← Correct

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const lead = await saveLead(req.body);

    if (!lead) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to save lead" 
      });
    }

    // Send email notification
    try {
      await sendLeadEmail(lead);
      console.log(`📧 Email notification sent for: ${lead.name}`);
    } catch (emailError) {
      console.warn("⚠️ Email failed but lead was saved:", emailError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Thank you! We'll contact you soon." 
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