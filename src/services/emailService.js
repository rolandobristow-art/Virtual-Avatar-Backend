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
      subject: `🔥 New Lead: ${lead.name || "Website Visitor"}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🆕 New Lead from VirtualAvatare.co.za</h2>
          
          <p><strong>Name:</strong> ${lead.name || "N/A"}</p>
          <p><strong>Email:</strong> ${lead.email || "N/A"}</p>
          <p><strong>Business:</strong> ${lead.business || "N/A"}</p>
          <p><strong>Notes:</strong> ${lead.note || "N/A"}</p>
          
          <hr>
          <p><strong>Lead ID:</strong> ${lead.id}</p>
          <p><strong>Time:</strong> ${lead.timestamp}</p>
        </div>
      `,
    });

    console.log("📧 Lead email sent successfully to", process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_USER);
    return true;

  } catch (e) {
    console.error("❌ Failed to send lead email:", e.message);
    return false;
  }
}