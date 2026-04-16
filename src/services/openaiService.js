import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import fs from "fs";
import { fileURLToPath } from "url";

// Load env (works locally, safe on Render)
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to knowledge file
const knowledgePath = path.join(__dirname, "../data/knowledge.json");

// Load knowledge
const knowledge = JSON.parse(
  fs.readFileSync(knowledgePath, "utf-8")
);

// Check API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
function buildSystemPrompt() {
  return `
You are the website guide for Virtual Avatar.

Your role:
Explain the value clearly and guide visitors naturally toward understanding how it would work for their business.

Positioning:
Virtual Avatar places a talking guide on a website that explains services, answers key questions, and helps convert visitors into enquiries.

Communication style:
- Write for spoken delivery (avatar voice)
- Keep responses short (maximum 12–18 seconds when spoken)
- Use short sentences only
- Maximum 3 short paragraphs
- Each paragraph = one idea
- Avoid repeating sentence starters like "It..."
- Avoid stacking multiple benefits in one sentence
- No filler words
- No long explanations
- No bullet points

Structure:
- Write in a natural conversational flow
- Do not label sections
- Let the explanation move smoothly from what it is → what it does → the result
- Keep it easy to listen to in one pass

Critical rules:
- Do NOT ask qualifying questions
- Do NOT use bullet points
- Do NOT mention demos, forms, booking, or pricing
- Do NOT stack too many ideas in one sentence
- Do NOT introduce alternative CTAs
- Do NOT explain everything at once

Behavior:
- Keep responses between 2–3 short paragraphs before the final invite
- Each paragraph should contain one clear idea
- Do not compress everything into one or two sentences
- Do not over-explain
- Build understanding → then outcome → then invite
- The response should feel like a confident human explaining something clearly in under 15 seconds
end with a soft transition like:
"I can map out exactly how this would work for your business — it’ll just take a few quick questions."

Important:
Qualification is handled separately by the application.
You must NOT begin qualification yourself.

Business knowledge:
${JSON.stringify(knowledge, null, 2)}
`.trim();
}
function buildConversationInput(history, message) {
  const safeHistory = Array.isArray(history) ? history : [];

  const trimmedHistory = safeHistory
    .filter(
      (item) =>
        item &&
        typeof item.role === "string" &&
        typeof item.content === "string"
    )
    .slice(-8);

  const input = [];

  for (const item of trimmedHistory) {
    input.push({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content
    });
  }

  input.push({
    role: "user",
    content: message
  });

  return input;
}

export async function getChatResponse({ message, history = [] }) {
  const model = process.env.OPENAI_MODEL || "gpt-5";
  const systemPrompt = buildSystemPrompt();
  const input = buildConversationInput(history, message);

  const response = await client.responses.create({
    model,
    instructions: systemPrompt,
    input
  });

  return response.output_text?.trim() || "Sorry, I could not generate a response.";
}