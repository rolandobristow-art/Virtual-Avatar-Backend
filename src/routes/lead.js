import express from "express";
import { saveLead } from "../services/leadService.js";
import { appendToSheet } from "../services/googleSheets.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      business,
      intent,
      problem,
      websiteStatus,
      finalAction,
      note
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required."
      });
    }

    const newLead = saveLead({
      name,
      email,
      phone,
      business,
      intent,
      problem,
      websiteStatus,
      finalAction,
      note
    });

    if (!newLead) {
      return res.status(500).json({ error: "Failed to save lead" });
    }

    // Optional: Save to Google Sheets
    try {
      await appendToSheet(newLead);
      console.log("✅ Lead also saved to Google Sheets");
    } catch (sheetError) {
      console.error("Google Sheets error:", sheetError.message);
    }

    console.log(`🎯 New lead captured: ${newLead.name} (${newLead.email})`);

    return res.json({
      success: true,
      message: "Thank you! Your details have been received.",
      lead: newLead
    });

  } catch (error) {
    console.error("Lead route error:", error);
    return res.status(500).json({
      error: "Could not save your details. Please try again."
    });
  }
});

export default router;