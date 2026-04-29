import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Correct path for your lead.json file
const leadsDir = path.join(__dirname, "../data");
const leadsFile = path.join(leadsDir, "lead.json");

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

function ensureLeadsFile() {
  if (!fs.existsSync(leadsDir)) {
    fs.mkdirSync(leadsDir, { recursive: true });
  }
  if (!fs.existsSync(leadsFile)) {
    fs.writeFileSync(leadsFile, "[]", "utf-8");
    console.log("✅ lead.json file created");
  }
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
      phone: String(answers.phone || "").trim(),
      business: String(answers.business || "").trim(),
      intent: String(answers.intent || "").trim(),
      problem: String(answers.problem || "").trim(),
      websiteStatus: String(answers.websiteStatus || "").trim(),
      finalAction: String(answers.finalAction || "").trim(),
      note: String(answers.note || "").trim(),
    };

    leads.push(newLead);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");

    // Send email notification
    await sendLeadEmail(newLead);

    console.log(`✅ Lead saved successfully: ${newLead.name || newLead.email}`);
    return newLead;

  } catch (err) {
    console.error("❌ Failed to save lead:", err.message);
    return null;
  }
}

async function sendLeadEmail(lead) {
  try {
    await transporter.sendMail({
      from: `"Virtual Avatar" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Lead: ${lead.name || "Anonymous"}`,
      html: `
        <h2>New Lead Captured</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Business:</strong> ${lead.business}</p>
        <p><strong>Intent:</strong> ${lead.intent}</p>
        <p><strong>Time:</strong> ${lead.timestamp}</p>
      `
    });
    console.log("📧 Lead email sent");
  } catch (e) {
    console.error("❌ Email sending failed:", e.message);
  }
}

export function getLeads() {
  ensureLeadsFile();
  try {
    const raw = fs.readFileSync(leadsFile, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}