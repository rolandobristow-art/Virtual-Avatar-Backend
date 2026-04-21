import express from "express";
import { saveLead } from "../services/leadService.js";
import { appendToSheet } from "../services/googleSheets.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      business,
      note,
      intent,
      problem,
      websiteStatus,
      finalAction
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required."
      });
    }

    const newLead = saveLead({
      name,
      email,
      business,
      note,
      intent,
      problem,
      websiteStatus,
      finalAction
    });

    try {
      await appendToSheet(newLead);
      console.log("Lead also saved to Google Sheets.");
    } catch (sheetError) {
      console.error("Google Sheets save error:", sheetError.message);
    }

    return res.json({
      success: true,
      message: "Lead captured successfully.",
      lead: newLead
    });
  } catch (error) {
    console.error("Lead route error:", error);
    return res.status(500).json({
      error: "Could not save lead."
    });
  }
});

export default router;