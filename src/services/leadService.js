import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leadsDir = path.join(__dirname, "../data");
const leadsFile = path.join(leadsDir, "leads.json");

// ====================== EMAIL SETUP ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,        // Your Gmail address
    pass: process.env.EMAIL_APP_PASSWORD // App Password (not normal password)
  }
});

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

    // Send Email Notification
    await sendLeadEmail(newLead);

    console.log(`✅ Lead saved and emailed: ${newLead.name || newLead.email}`);
    return newLead;

  } catch (err) {
    console.error("❌ Failed to save lead:", err.message);
    return null;
  }
}

async function sendLeadEmail(lead) {
  try {
    await transporter.sendMail({
      from: `"Virtual Avatar Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,   // Send to yourself
      subject: `New Lead: ${lead.name || "Anonymous"}`,
      html: `
        <h2>New Lead Captured</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Business:</strong> ${lead.business}</p>
        <p><strong>Intent:</strong> ${lead.intent}</p>
        <p><strong>Problem:</strong> ${lead.problem}</p>
        <p><strong>Final Action:</strong> ${lead.finalAction}</p>
        <p><strong>Time:</strong> ${lead.timestamp}</p>
        <hr>
        <p><em>Check leads.json for full details.</em></p>
      `
    });
    console.log("📧 Lead email sent successfully");
  } catch (emailErr) {
    console.error("❌ Failed to send lead email:", emailErr.message);
  }
}

export function getLeads() {
  ensureLeadsFile();
  try {
    const raw = fs.readFileSync(leadsFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}