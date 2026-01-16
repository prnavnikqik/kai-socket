/**
 * Vector Service
 * Handles generating embeddings for Semantic Search
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-004";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;

/**
 * Generate a vector embedding for a piece of text
 */
export async function generateEmbedding(text) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY required for Semantic Search testing.");
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: { parts: [{ text }] }
        })
    });

    if (!response.ok) {
        throw new Error(`Embedding Error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values; // Returns an array of ~768 numbers
}

/**
 * Calculate Cosine Similarity between two vectors (for local/in-memory testing)
 */
export function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}