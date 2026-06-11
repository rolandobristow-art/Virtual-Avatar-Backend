import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

export async function sendLeadEmail(lead) {
  try {
    console.log("📧 Attempting to send lead email...");

    const info = await transporter.sendMail({
      from: `"Virtual Avatar Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_USER,
      subject: `New Virtual Avatar Lead: ${lead.name || "Website Lead"}`,
      text: `
New lead received from Virtual Avatar website:

Name: ${lead.name || ""}
Email: ${lead.email || ""}
Phone: ${lead.phone || ""}
Business: ${lead.business || ""}
Intent: ${lead.intent || ""}
Problem: ${lead.problem || ""}
Website Status: ${lead.websiteStatus || ""}
Final Action: ${lead.finalAction || ""}
Message: ${lead.note || lead.message || ""}
Created: ${lead.createdAt || new Date().toISOString()}
      `,
    });

    console.log("✅ Lead email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send lead email:", error.message);
    return false;
  }
}