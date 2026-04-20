import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct paths (NO src/... hardcoding)
const leadsDir = path.join(__dirname, "../data");
const leadsFile = path.join(leadsDir, "leads.json");

function ensureLeadsFile() {
  if (!fs.existsSync(leadsDir)) {
    fs.mkdirSync(leadsDir, { recursive: true });
  }

  if (!fs.existsSync(leadsFile)) {
    fs.writeFileSync(leadsFile, "[]", "utf-8");
  }
}

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

    ensureLeadsFile();

    const raw = fs.readFileSync(leadsFile, "utf-8");
    const leads = JSON.parse(raw);

    const newLead = {
      id: Date.now(),
      name: String(name).trim(),
      email: String(email).trim(),
      business: business ? String(business).trim() : "",
      intent: intent ? String(intent).trim() : "",
      problem: problem ? String(problem).trim() : "",
      websiteStatus: websiteStatus ? String(websiteStatus).trim() : "",
      finalAction: finalAction ? String(finalAction).trim() : "",
      note: note ? String(note).trim() : "",
      createdAt: new Date().toISOString()
    };

    leads.push(newLead);

    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

    try {
      await appendToSheet(newLead);
      console.log("Lead also saved to Google Sheets.");
    } catch (sheetError) {
      console.error("Google Sheets save error:", sheetError.message);
    }

    return res.json({
      success: true,
      message: "Lead captured successfully."
    });
  } catch (error) {
    console.error("Lead route error:", error);
    return res.status(500).json({
      error: "Could not save lead."
    });
  }
});

export default router;