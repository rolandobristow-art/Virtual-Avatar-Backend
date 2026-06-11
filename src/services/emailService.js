import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,              // mail.virtualavatar.co.za
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,                            // false for port 587
  auth: {
    user: process.env.EMAIL_USER,            // hello@virtualavatar.co.za
    pass: process.env.EMAIL_PASS,            // Hostking mailbox password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
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