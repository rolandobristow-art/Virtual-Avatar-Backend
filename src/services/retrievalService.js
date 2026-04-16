import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.join(__dirname, "../data/knowledge.json");

let knowledgeCache = null;

async function loadKnowledgeFile() {
  if (knowledgeCache) return knowledgeCache;

  const file = await fs.readFile(knowledgePath, "utf-8");
  const parsed = JSON.parse(file);

  if (Array.isArray(parsed)) {
    knowledgeCache = parsed;
  } else if (Array.isArray(parsed.items)) {
    knowledgeCache = parsed.items;
  } else if (Array.isArray(parsed.knowledge)) {
    knowledgeCache = parsed.knowledge;
  } else {
    knowledgeCache = [];
  }

  return knowledgeCache;
}

function normalize(text = "") {
  return String(text).toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text = "") {
  return normalize(text)
    .split(" ")
    .filter((word) => word.length > 2);
}

function scoreEntry(queryWords, entryText) {
  const textWords = new Set(tokenize(entryText));
  let score = 0;

  for (const word of queryWords) {
    if (textWords.has(word)) score += 1;
  }

  return score;
}

function entryToText(entry) {
  if (typeof entry === "string") return entry;

  if (typeof entry === "object" && entry !== null) {
    return [
      entry.title || "",
      entry.question || "",
      entry.answer || "",
      entry.content || "",
      entry.text || "",
      entry.description || ""
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

export async function getRelevantKnowledge(userMessage, limit = 3) {
  const knowledge = await loadKnowledgeFile();

  if (!knowledge.length) {
    return [];
  }

  const queryWords = tokenize(userMessage);

  const ranked = knowledge
    .map((entry) => {
      const searchableText = entryToText(entry);
      return {
        entry,
        score: scoreEntry(queryWords, searchableText)
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);

  return ranked;
}

export async function buildKnowledgeContext(userMessage, limit = 3) {
  const matches = await getRelevantKnowledge(userMessage, limit);

  if (!matches.length) {
    return "";
  }

  return matches
    .map((entry, index) => {
      if (typeof entry === "string") {
        return `Source ${index + 1}: ${entry}`;
      }

      const parts = [
        entry.title ? `Title: ${entry.title}` : "",
        entry.question ? `Question: ${entry.question}` : "",
        entry.answer ? `Answer: ${entry.answer}` : "",
        entry.content ? `Content: ${entry.content}` : "",
        entry.text ? `Text: ${entry.text}` : "",
        entry.description ? `Description: ${entry.description}` : ""
      ].filter(Boolean);

      return `Source ${index + 1}:\n${parts.join("\n")}`;
    })
    .join("\n\n");
}

export function clearKnowledgeCache() {
  knowledgeCache = null;
}