/**
 * Embedding Generation Library
 * 
 * Provides utilities for generating and managing embeddings for AI/RAG functionality.
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions).
 * 
 * Features:
 * - Generate embeddings from text content
 * - Content hashing for change detection
 * - Metadata tracking (model version, timestamps)
 * - Batch processing support
 */

import { createHash } from 'crypto';

// OpenAI configuration
// Note: Read from process.env at runtime, not module load time
const OPENAI_MODEL = 'text-embedding-3-small'; // 1536 dimensions
const getOpenAIEndpoint = () => process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/embeddings';

// Embedding configuration
export const EMBEDDING_DIMENSIONS = 1536;
export const EMBEDDING_MODEL = OPENAI_MODEL;

/**
 * Generate a SHA-256 hash of content for change detection
 */
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Prepare text content for embedding generation
 * Handles cleaning, normalization, and truncation
 */
export function prepareContent(
  title: string,
  description?: string,
  additionalFields?: Record<string, string>
): string {
  const parts: string[] = [title];

  if (description) {
    parts.push(description);
  }

  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (value) {
        parts.push(`${key}: ${value}`);
      }
    });
  }

  // Join with newlines and normalize whitespace
  const content = parts.join('\n\n').trim();
  
  // Truncate to ~8000 tokens (rough estimate: 1 token ≈ 4 chars)
  const maxChars = 32000;
  return content.length > maxChars ? content.substring(0, maxChars) : content;
}

/**
 * Generate embedding using OpenAI API
 * 
 * @param text - The text content to embed
 * @returns Array of 1536 floating point numbers
 * @throws Error if API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    const response = await fetch(getOpenAIEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: text,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No embedding returned from OpenAI API');
    }

    const embedding = data.data[0].embedding;
    
    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${embedding?.length || 0}`);
    }

    return embedding;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * Useful for bulk operations, but be mindful of rate limits
 * 
 * @param texts - Array of text strings to embed
 * @returns Array of embedding arrays
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  // For now, process sequentially to avoid rate limits
  // In production, consider using OpenAI's batch API or parallel processing with rate limiting
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

/**
 * Create metadata object for embedding storage
 */
export function createEmbeddingMetadata(additionalData?: Record<string, unknown>) {
  return JSON.stringify({
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    generatedAt: new Date().toISOString(),
    ...additionalData,
  });
}

/**
 * Calculate cosine similarity between two embeddings
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 * 
 * Note: This is for application-level similarity calculation until pgvector is available
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Find top K most similar embeddings from a list
 */
export function findTopSimilar(
  queryEmbedding: number[],
  candidateEmbeddings: Array<{ id: number; embedding: number[] }>,
  k: number = 5
): Array<{ id: number; similarity: number }> {
  const similarities = candidateEmbeddings.map(candidate => ({
    id: candidate.id,
    similarity: cosineSimilarity(queryEmbedding, candidate.embedding),
  }));

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Return top K
  return similarities.slice(0, k);
}
