import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Required for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to knowledge folder
const knowledgeDir = path.join(__dirname, "../knowledge");

// Break text into words
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Simple keyword matching score
function scoreText(query, content) {
  const queryTokens = tokenize(query);
  const contentTokens = tokenize(content);
  const contentSet = new Set(contentTokens);

  let score = 0;

  for (const token of queryTokens) {
    if (contentSet.has(token)) {
      score += 1;
    }
  }

  return score;
}

// Split long text into chunks
function chunkText(text, maxLength = 1200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }

  return chunks;
}

// Main function used in chat.js
export async function getRelevantKnowledge(query) {
  try {
    const files = await fs.readdir(knowledgeDir);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    const results = [];

    for (const file of markdownFiles) {
      const fullPath = path.join(knowledgeDir, file);
      const content = await fs.readFile(fullPath, "utf-8");

      const chunks = chunkText(content);

      for (const chunk of chunks) {
        const score = scoreText(query, chunk);

        if (score > 0) {
          results.push({
            file,
            text: chunk,
            score,
          });
        }
      }
    }

    // Sort by best match
    const sorted = results.sort((a, b) => b.score - a.score);

    // Return top matches
    return sorted.slice(0, 4);

  } catch (error) {
    console.error("Retrieval error:", error);
    return [];
  }
}