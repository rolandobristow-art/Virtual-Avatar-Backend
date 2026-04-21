import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data path
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

export function saveLead(answers = {}) {
  ensureLeadsFile();

  const raw = fs.readFileSync(leadsFile, "utf-8");
  const leads = JSON.parse(raw);

  const newLead = {
    id: "lead_" + Date.now(),
    name: answers.name ? String(answers.name).trim() : "",
    email: answers.email ? String(answers.email).trim() : "",
    business: answers.business ? String(answers.business).trim() : "",
    intent: answers.intent ? String(answers.intent).trim() : "",
    problem: answers.problem ? String(answers.problem).trim() : "",
    websiteStatus: answers.websiteStatus ? String(answers.websiteStatus).trim() : "",
    finalAction: answers.finalAction ? String(answers.finalAction).trim() : "",
    note: answers.note ? String(answers.note).trim() : "",
    createdAt: new Date().toISOString()
  };

  leads.push(newLead);

  fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

  return newLead;
}

export function getLeads() {
  ensureLeadsFile();

  const raw = fs.readFileSync(leadsFile, "utf-8");
  return JSON.parse(raw);
}