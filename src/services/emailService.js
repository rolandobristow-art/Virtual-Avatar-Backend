import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendLeadEmail(lead) {
  try {
    await transporter.sendMail({
      from: `"Virtual Avatar Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_USER,
      subject: `🔥 New Lead: ${lead.name || "Website visitor"}`,
      html: `
        <h2>New Lead Captured</h2>

        <p><strong>Name:</strong> ${lead.name || "N/A"}</p>
        <p><strong>Email:</strong> ${lead.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
        <p><strong>Business:</strong> ${lead.business || "N/A"}</p>

        <hr/>

        <p><strong>Intent:</strong> ${lead.intent || "N/A"}</p>
        <p><strong>Problem:</strong> ${lead.problem || "N/A"}</p>
        <p><strong>Website Status:</strong> ${lead.websiteStatus || "N/A"}</p>
        <p><strong>Final Action:</strong> ${lead.finalAction || "N/A"}</p>

        <hr/>

        <p><strong>Notes:</strong> ${lead.note || "N/A"}</p>
        <p><strong>Captured at:</strong> ${lead.createdAt || lead.timestamp || new Date().toISOString()}</p>
      `,
    });

    console.log("📧 Lead email sent successfully");
    return true;

  } catch (e) {
    console.error("❌ Failed to send lead email:", e.message);
    return false;
  }
}