/**
 * Retrieval Layer for Semantic Search and RAG
 * 
 * Provides functions to find similar content based on semantic embeddings.
 * Used for:
 * - Semantic search (find similar engagements/signals)
 * - RAG context retrieval (provide relevant context to AI assistant)
 * - Content recommendations
 * 
 * Note: Uses application-level cosine similarity until pgvector is available.
 * Once pgvector is installed, can use native vector search operators.
 */

import { db } from '@/db/client';
import {
  engagements,
  signals,
  engagementEmbeddings,
  signalEmbeddings,
} from '@/db/schema';
import { sql } from 'drizzle-orm';
import {
  generateEmbedding,
  cosineSimilarity,
} from './embeddings';

/**
 * Search result with similarity score
 */
export interface SearchResult<T> {
  item: T;
  similarity: number;
  rank: number;
}

/**
 * Engagement with full details for display
 */
export interface EngagementResult {
  id: number;
  name: string;
  clientName: string;
  status: string;
  description: string | null;
  techTags: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Signal with full details for display
 */
export interface SignalResult {
  id: number;
  title: string;
  description: string;
  engagementId: number;
  createdBy: string;
  status: string;
  urgency: string;
  requiredSkills: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Find similar engagements based on semantic similarity
 * 
 * @param queryText - The search query text
 * @param limit - Maximum number of results to return
 * @param minSimilarity - Minimum similarity score (0-1) to include
 * @returns Array of engagements with similarity scores
 */
export async function findSimilarEngagements(
  queryText: string,
  limit: number = 10,
  minSimilarity: number = 0.5
): Promise<SearchResult<EngagementResult>[]> {
  try {
    // Generate embedding for query
    console.log('[Retrieval] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(queryText);

    // Fetch all engagement embeddings
    console.log('[Retrieval] Fetching engagement embeddings...');
    const allEmbeddings = await db
      .select({
        id: engagementEmbeddings.id,
        engagementId: engagementEmbeddings.engagementId,
        embeddingJson: engagementEmbeddings.embeddingJson,
      })
      .from(engagementEmbeddings);

    if (allEmbeddings.length === 0) {
      console.log('[Retrieval] No engagement embeddings found');
      return [];
    }

    // Calculate similarity scores
    console.log(`[Retrieval] Calculating similarities for ${allEmbeddings.length} engagements...`);
    const similarities = allEmbeddings.map((emb) => {
      const embedding = JSON.parse(emb.embeddingJson) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return {
        engagementId: emb.engagementId,
        similarity,
      };
    });

    // Filter by minimum similarity and sort
    const filtered = similarities
      .filter((s) => s.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    if (filtered.length === 0) {
      console.log('[Retrieval] No engagements meet minimum similarity threshold');
      return [];
    }

    // Fetch full engagement details
    const engagementIds = filtered.map((s) => s.engagementId);
    const engagementDetails = await db
      .select()
      .from(engagements)
      .where(sql`${engagements.id} IN ${engagementIds}`);

    // Map to engagement details with similarity scores
    const results: SearchResult<EngagementResult>[] = filtered.map((s, index) => {
      const engagement = engagementDetails.find((e) => e.id === s.engagementId);
      if (!engagement) {
        throw new Error(`Engagement ${s.engagementId} not found`);
      }

      return {
        item: {
          id: engagement.id,
          name: engagement.name,
          clientName: engagement.clientName,
          status: engagement.status,
          description: engagement.description,
          techTags: engagement.techTags,
          createdAt: engagement.createdAt,
          updatedAt: engagement.updatedAt,
        },
        similarity: s.similarity,
        rank: index + 1,
      };
    });

    console.log(`[Retrieval] Found ${results.length} similar engagements`);
    return results;
  } catch (error) {
    console.error('[Retrieval] Error finding similar engagements:', error);
    throw error;
  }
}

/**
 * Find similar signals based on semantic similarity
 * 
 * @param queryText - The search query text
 * @param limit - Maximum number of results to return
 * @param minSimilarity - Minimum similarity score (0-1) to include
 * @returns Array of signals with similarity scores
 */
export async function findSimilarSignals(
  queryText: string,
  limit: number = 10,
  minSimilarity: number = 0.5
): Promise<SearchResult<SignalResult>[]> {
  try {
    // Generate embedding for query
    console.log('[Retrieval] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(queryText);

    // Fetch all signal embeddings
    console.log('[Retrieval] Fetching signal embeddings...');
    const allEmbeddings = await db
      .select({
        id: signalEmbeddings.id,
        signalId: signalEmbeddings.signalId,
        embeddingJson: signalEmbeddings.embeddingJson,
      })
      .from(signalEmbeddings);

    if (allEmbeddings.length === 0) {
      console.log('[Retrieval] No signal embeddings found');
      return [];
    }

    // Calculate similarity scores
    console.log(`[Retrieval] Calculating similarities for ${allEmbeddings.length} signals...`);
    const similarities = allEmbeddings.map((emb) => {
      const embedding = JSON.parse(emb.embeddingJson) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return {
        signalId: emb.signalId,
        similarity,
      };
    });

    // Filter by minimum similarity and sort
    const filtered = similarities
      .filter((s) => s.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    if (filtered.length === 0) {
      console.log('[Retrieval] No signals meet minimum similarity threshold');
      return [];
    }

    // Fetch full signal details
    const signalIds = filtered.map((s) => s.signalId);
    const signalDetails = await db
      .select()
      .from(signals)
      .where(sql`${signals.id} IN ${signalIds}`);

    // Map to signal details with similarity scores
    const results: SearchResult<SignalResult>[] = filtered.map((s, index) => {
      const signal = signalDetails.find((sig) => sig.id === s.signalId);
      if (!signal) {
        throw new Error(`Signal ${s.signalId} not found`);
      }

      return {
        item: {
          id: signal.id,
          title: signal.title,
          description: signal.description,
          engagementId: signal.engagementId,
          createdBy: signal.createdBy,
          status: signal.status,
          urgency: signal.urgency,
          requiredSkills: signal.requiredSkills,
          resolutionSummary: signal.resolutionSummary,
          createdAt: signal.createdAt,
          updatedAt: signal.updatedAt,
        },
        similarity: s.similarity,
        rank: index + 1,
      };
    });

    console.log(`[Retrieval] Found ${results.length} similar signals`);
    return results;
  } catch (error) {
    console.error('[Retrieval] Error finding similar signals:', error);
    throw error;
  }
}

/**
 * Find related content (both engagements and signals) for a given query
 * Useful for comprehensive search across all content types
 */
export async function findRelatedContent(
  queryText: string,
  options: {
    engagementLimit?: number;
    signalLimit?: number;
    minSimilarity?: number;
  } = {}
): Promise<{
  engagements: SearchResult<EngagementResult>[];
  signals: SearchResult<SignalResult>[];
}> {
  const {
    engagementLimit = 5,
    signalLimit = 5,
    minSimilarity = 0.5,
  } = options;

  // Search both in parallel
  const [engagements, signals] = await Promise.all([
    findSimilarEngagements(queryText, engagementLimit, minSimilarity),
    findSimilarSignals(queryText, signalLimit, minSimilarity),
  ]);

  return {
    engagements,
    signals,
  };
}

/**
 * Get RAG context for AI assistant
 * Retrieves relevant content to ground AI responses
 * 
 * @param query - User's question or query
 * @param maxTokens - Approximate maximum tokens to include (rough estimate)
 * @returns Formatted context string for RAG
 */
export async function getRAGContext(
  query: string,
  maxTokens: number = 2000
): Promise<{
  context: string;
  sources: Array<{
    type: 'engagement' | 'signal';
    id: number;
    title: string;
    similarity: number;
  }>;
}> {
  try {
    console.log(`[RAG] Retrieving context for query: "${query.substring(0, 50)}..."`);

    // Find relevant content (fewer results for RAG to fit in context window)
    const related = await findRelatedContent(query, {
      engagementLimit: 3,
      signalLimit: 3,
      minSimilarity: 0.6, // Higher threshold for RAG
    });

    // Prepare context sections
    const contextParts: string[] = [];
    const sources: Array<{
      type: 'engagement' | 'signal';
      id: number;
      title: string;
      similarity: number;
    }> = [];

    // Rough token estimation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    let currentChars = 0;

    // Add engagement context
    if (related.engagements.length > 0) {
      contextParts.push('=== RELEVANT PROJECTS ===\n');
      currentChars += contextParts[contextParts.length - 1].length;

      for (const result of related.engagements) {
        const eng = result.item;
        const engContext = [
          `Project: ${eng.name}`,
          `Client: ${eng.clientName}`,
          `Status: ${eng.status}`,
          eng.description ? `Description: ${eng.description}` : null,
          eng.techTags ? `Technologies: ${eng.techTags}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        const engChars = engContext.length + 50; // +50 for formatting

        if (currentChars + engChars > maxChars) {
          break; // Stop if we exceed token limit
        }

        contextParts.push(engContext + '\n');
        currentChars += engChars;

        sources.push({
          type: 'engagement',
          id: eng.id,
          title: eng.name,
          similarity: result.similarity,
        });
      }
    }

    // Add signal context
    if (related.signals.length > 0 && currentChars < maxChars) {
      contextParts.push('\n=== RELEVANT SIGNALS ===\n');
      currentChars += contextParts[contextParts.length - 1].length;

      for (const result of related.signals) {
        const sig = result.item;
        const sigContext = [
          `Signal: ${sig.title}`,
          `Status: ${sig.status} | Urgency: ${sig.urgency}`,
          `Description: ${sig.description}`,
          sig.requiredSkills ? `Skills Needed: ${sig.requiredSkills}` : null,
          sig.resolutionSummary ? `Resolution: ${sig.resolutionSummary}` : null,
        ]
          .filter(Boolean)
          .join('\n');

        const sigChars = sigContext.length + 50;

        if (currentChars + sigChars > maxChars) {
          break; // Stop if we exceed token limit
        }

        contextParts.push(sigContext + '\n');
        currentChars += sigChars;

        sources.push({
          type: 'signal',
          id: sig.id,
          title: sig.title,
          similarity: result.similarity,
        });
      }
    }

    const context = contextParts.join('\n');

    console.log(`[RAG] Retrieved ${sources.length} sources, ~${Math.ceil(currentChars / 4)} tokens`);

    return {
      context,
      sources,
    };
  } catch (error) {
    console.error('[RAG] Error retrieving context:', error);
    // Return empty context rather than failing
    return {
      context: '',
      sources: [],
    };
  }
}
