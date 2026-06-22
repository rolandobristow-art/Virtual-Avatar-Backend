import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ OPENAI_API_KEY is missing");
}

// ====================== ROBUST KNOWLEDGE BASE LOADING ======================
let knowledgeBase = "";

function loadKnowledgeBase() {
  const possiblePaths = [
  path.join(process.cwd(), "Data", "knowledge.json"),
  path.join(process.cwd(), "data", "knowledge.json"),

  path.join(process.cwd(), "src", "Data", "knowledge.json"),
  path.join(process.cwd(), "src", "data", "knowledge.json"),

  path.join(__dirname, "../../Data/knowledge.json"),
  path.join(__dirname, "../../data/knowledge.json"),

  path.join(__dirname, "../Data/knowledge.json"),
  path.join(__dirname, "../data/knowledge.json"),
];

  for (const knowledgePath of possiblePaths) {
    console.log("Trying knowledge path:", knowledgePath);
    try {
        if (fs.existsSync(knowledgePath)) {
        const raw = fs.readFileSync(knowledgePath, "utf-8");
        const parsed = JSON.parse(raw);

        // Convert structured JSON into clean text for the AI
        knowledgeBase = `
Brand Name: ${parsed.brand?.name || "Virtual Avatar"}
Positioning: ${parsed.brand?.positioning || ""}

What It Is:
${(parsed.what_it_is || []).join("\n")}

What It Is Not:
${(parsed.what_it_is_not || []).join("\n")}

Core Benefits:
${(parsed.core_benefits || []).join("\n")}

Ideal Use Cases:
${(parsed.ideal_use_cases || []).join("\n")}

Common Questions:
${Object.entries(parsed.common_questions || {})
  .map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
  .join("\n")}

Style Rules:
${(parsed.style_rules || []).join("\n")}
`.trim();

        console.log(`✅ Knowledge base loaded successfully from: ${knowledgePath}`);
        return;
      }
    } catch (err) {
      console.warn(`Failed to load from ${knowledgePath}: ${err.message}`);
    }
  }

  console.warn("⚠️ Could not load knowledge.json from any path. Using empty knowledge base.");
}

loadKnowledgeBase();

// ====================== SYSTEM PROMPT ======================
function buildSystemPrompt() {
  return `
You are Karen, the Virtual Avatar website guide.

You are confident, warm, helpful, and slightly sassy — but still professional.

Virtual Avatar is NOT positioned as an "AI Avatar Company".
Virtual Avatar is a customer engagement platform powered by AI Humans.

Your job:
- Help website visitors understand what Virtual Avatar does.
- Focus on business outcomes, not technical features.
- Explain how AI Humans help websites engage visitors, answer questions, reduce confusion, and generate better enquiries.
- Guide interested visitors toward requesting their own AI Human.

Important language rules:
- Say "AI Human", "digital presenter", "website guide", or "Virtual Avatar".
- Do not overuse the word "AI".
- Do not say "chatbot" unless the user asks specifically about chatbots.
- Do not mention HeyGen, LiveAvatar, OpenAI, Render, or backend systems.
- Do not give technical setup instructions.
- Do not say you are a support agent.
- Never invent pricing.
- If asked about pricing, say quotes are tailored depending on the business, avatar, script, and integration needs.

Tone:
- Short, clear, friendly.
- Speak like a real person helping a business owner.
- No long essays.
- No generic marketing fluff.
- Be practical and outcome-focused.

Core message:
Virtual Avatar helps a website do more than display information.
It gives visitors a friendly AI Human guide who can welcome them, explain the offer, answer common questions, and guide them toward an enquiry.

Good outcomes to mention:
- More qualified enquiries
- Better customer engagement
- Faster answers
- Reduced bounce
- Clearer website messaging
- Lead capture
- Better first impression
- Support for onboarding, training, and customer service

When someone shows interest:
Gently say:
"I can show you how this could work for your business — it just takes a few quick questions."

Use this knowledge base when relevant:
${knowledgeBase || "No extra knowledge base loaded."}
`.trim();
}

// ====================== CHAT FUNCTION ======================
export async function getChatResponse({ message, history = [] }) {
  try {
    const messages = [
      { role: "system", content: buildSystemPrompt() },
      ...history.slice(-10).map(item => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.content
      })),
      { role: "user", content: message }
    ];

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.75,
      max_tokens: 320,
    });

    return response.choices?.[0]?.message?.content?.trim() 
      || "Sorry, I couldn't generate a response right now.";

  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return "Sorry, something went wrong. Please try again.";
  }
}