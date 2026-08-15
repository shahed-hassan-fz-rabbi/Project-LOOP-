import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Deterministic lexical-semantic token vectorizer (128-dim lightweight embedding fallback)
function fallbackHashEmbedding(text: string): number[] {
  const vector = new Array(128).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 128;
    vector[idx] += 1;
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < 128; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < 128; i++) vector[i] /= norm;
  }
  return vector;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return fallbackHashEmbedding(text);
  } catch (error) {
    console.error("Embedding generation error:", error);
    return fallbackHashEmbedding(text);
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return Math.max(0, Math.min(1, dotProduct / (normA * normB)));
}