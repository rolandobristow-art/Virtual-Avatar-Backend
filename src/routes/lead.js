import express from 'express';
import { saveLead } from '../services/leadService.js';        // ← Correct (plural + one level up)
import { sendLeadEmail } from '../services/emailService.js';  // ← Correct
import { createOpportunityReport } from "../services/opportunityReportService.js";

const router = express.Router();

router.post('/', async (req, res) => {
  try {
   
    const opportunityReport = await createOpportunityReport({
  lead: req.body,
  conversation: req.body.conversation || [],
});

const lead = await saveLead({
  ...req.body,
  summary: opportunityReport,
});
    if (!lead) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to save lead" 
      });
    }

    // Send email notification
    try {
     const emailSent = await sendLeadEmail(lead, opportunityReport);

if (emailSent) {
  console.log(`📧 Email notification sent for: ${lead.name}`);
} else {
  console.warn(`⚠️ Email notification failed for: ${lead.name}`);
}
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