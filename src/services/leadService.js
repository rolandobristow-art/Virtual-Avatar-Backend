import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leadsDir = path.join(__dirname, "../data");
const leadsFile = path.join(leadsDir, "leads.json");

function ensureLeadsFile() {
  if (!fs.existsSync(leadsDir)) fs.mkdirSync(leadsDir, { recursive: true });
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, "[]", "utf-8");
}

export async function saveLead(answers = {}) {
  ensureLeadsFile();

  try {
    const raw = fs.readFileSync(leadsFile, "utf-8");
    const leads = JSON.parse(raw);

    const newLead = {
      id: "lead_" + Date.now(),
      timestamp: new Date().toISOString(),
      name: String(answers.name || "").trim(),
      email: String(answers.email || "").trim(),
      business: String(answers.business || "").trim(),
      intent: String(answers.intent || "").trim(),
      problem: String(answers.problem || "").trim(),
      note: String(answers.note || "").trim(),
    };

    leads.push(newLead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

    console.log(`✅ Lead saved: ${newLead.name} (${newLead.email})`);
    return newLead;
  } catch (err) {
    console.error("❌ Save lead failed:", err.message);
    return null;
  }
}