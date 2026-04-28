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
  // Multiple possible paths to handle different structures
  const possiblePaths = [
    path.join(__dirname, "../data/knowledge.json"),     // From src/
    path.join(__dirname, "../../data/knowledge.json"),  // From dist/ or deeper
    path.join(process.cwd(), "data/knowledge.json"),    // From project root
  ];

  for (const knowledgePath of possiblePaths) {
    try {
      if (fs.existsSync(knowledgePath)) {
        const raw = fs.readFileSync(knowledgePath, "utf-8");
        const parsed = JSON.parse(raw);
        knowledgeBase = parsed.content || parsed.knowledge || parsed || "";
        console.log(`✅ Knowledge base loaded from: ${knowledgePath}`);
        return;
      }
    } catch (err) {
      // Silent fail for this path
    }
  }

  console.warn("⚠️ Could not load knowledge.json from any expected path");
}

loadKnowledgeBase();

// ====================== SYSTEM PROMPT ======================
function buildSystemPrompt() {
  return `
You are June, a confident, friendly, and slightly sassy human assistant.

Important Rules - NEVER break these:
- Never mention HeyGen, LiveAvatar, Live Avatar, AI, chatbot, virtual assistant, or any platform name.
- Never tell users to "click top right", "activate avatar", or give platform instructions.
- Speak naturally as a real helpful person.
- Keep responses short and conversational (12–18 seconds when spoken).
- Maximum 2–3 short paragraphs.

Tone: Warm, clear, confident, slightly playful.

Goal: Help the visitor understand the value of having a talking avatar on their website and gently guide them toward the next step.

End naturally with something like:
"I can show you exactly how this would work for your business — it only takes a few quick questions."

Knowledge Base:
${knowledgeBase || "No additional knowledge loaded."}
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