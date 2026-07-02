import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createOpportunityReport({ lead, conversation = [] }) {
  try {
    const conversationText = conversation
      .map((msg) => `${msg.role}: ${msg.message}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
You create concise customer engagement opportunity reports for Virtual Avatar.

Return valid JSON only.

Structure:
{
  "summary": "",
  "opportunities": [],
  "recommendedSolution": "",
  "nextStep": "",
  "buyingIntent": "Low | Medium | High"
}
          `,
        },
        {
          role: "user",
          content: `
Lead:
Name: ${lead.name || "N/A"}
Email: ${lead.email || "N/A"}
Business: ${lead.business || "N/A"}
Notes: ${lead.note || "N/A"}

Conversation:
${conversationText || "No conversation provided."}
          `,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "{}";

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Opportunity report failed:", error.message);

    return {
      summary: "A visitor requested more information about Virtual Avatar.",
      opportunities: [
        "Improve customer engagement",
        "Answer common questions",
        "Support better follow-up conversations",
      ],
      recommendedSolution: "AI Website Assistant",
      nextStep: "Book a short discovery call.",
      buyingIntent: "Medium",
    };
  }
}