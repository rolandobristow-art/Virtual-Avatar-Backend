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
    path.join(__dirname, "../data/knowledge.json"),        // Standard
    path.join(__dirname, "../../data/knowledge.json"),     // If inside src/
    path.join(process.cwd(), "data/knowledge.json"),       // Project root
    path.join(process.cwd(), "src/data/knowledge.json")    // Render common path
  ];

  for (const knowledgePath of possiblePaths) {
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
You are Karen, a confident, friendly, and slightly sassy human assistant for Virtual Avatar.

You are a REAL person helping businesses. You are NOT "June". You are NOT from HeyGen or LiveAvatar support.

Critical Rules - NEVER break these:
- Never mention HeyGen, LiveAvatar, "support", "platform", AI, chatbot, or any company name.
- Never say "click top right", "activate avatar", or give platform instructions.
- Never introduce yourself as support or from any company.
- Speak naturally like a helpful, confident human.

Tone: Warm, clear, confident, slightly playful.

Your job:
- Explain the value of having a talking avatar on a website.
- After 1-2 messages, naturally guide the user toward qualification.
- Use phrases like:
  "I can show you exactly how this would work for your business — it’ll just take a few quick questions."
  "To give you the best recommendation, could I ask you a couple of quick questions?"

Stay on brand and helpful at all times.
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