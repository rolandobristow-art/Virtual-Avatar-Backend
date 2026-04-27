import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const leadsDir = path.join(__dirname, "../data");
const leadsFile = path.join(leadsDir, "leads.json");

function ensureLeadsFile() {
  try {
    if (!fs.existsSync(leadsDir)) {
      fs.mkdirSync(leadsDir, { recursive: true });
    }

    if (!fs.existsSync(leadsFile)) {
      fs.writeFileSync(leadsFile, "[]", "utf-8");
      console.log("✅ leads.json file created");
    }
  } catch (err) {
    console.error("❌ Failed to create leads directory/file:", err.message);
  }
}

export function saveLead(answers = {}) {
  ensureLeadsFile();

  try {
    const raw = fs.readFileSync(leadsFile, "utf-8");
    const leads = JSON.parse(raw);

    const newLead = {
      id: "lead_" + Date.now(),
      timestamp: new Date().toISOString(),
      
      // Core contact info
      name: String(answers.name || "").trim(),
      email: String(answers.email || "").trim(),
      phone: String(answers.phone || "").trim(),
      
      // Business info
      business: String(answers.business || "").trim(),
      website: String(answers.website || "").trim(),
      
      // Qualification
      intent: String(answers.intent || "").trim(),
      problem: String(answers.problem || "").trim(),
      websiteStatus: String(answers.websiteStatus || "").trim(),
      
      // Extra
      note: String(answers.note || "").trim(),
      finalAction: String(answers.finalAction || "").trim(),
    };

    leads.push(newLead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

    console.log(`✅ New lead saved: ${newLead.name} (${newLead.email})`);
    return newLead;

  } catch (err) {
    console.error("❌ Failed to save lead:", err.message);
    return null;
  }
}

export function getLeads() {
  ensureLeadsFile();
  try {
    const raw = fs.readFileSync(leadsFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to read leads:", err.message);
    return [];
  }
}