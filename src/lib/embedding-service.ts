/**
 * Embedding Service
 * 
 * High-level service for managing embeddings for engagements and signals.
 * Handles:
 * - Change detection (only re-embed if content changed)
 * - Database persistence
 * - Error handling and logging
 */

import { db } from '@/db/client';
import { engagements, signals, engagementEmbeddings, signalEmbeddings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  generateEmbedding,
  generateContentHash,
  prepareContent,
  createEmbeddingMetadata,
  EMBEDDING_DIMENSIONS,
} from './embeddings';

/**
 * Generate and store embedding for an engagement
 * Returns the embedding ID if successful, or null if skipped (no changes)
 */
export async function embedEngagement(engagementId: number): Promise<number | null> {
  try {
    // Fetch engagement data
    const engagement = await db
      .select()
      .from(engagements)
      .where(eq(engagements.id, engagementId))
      .limit(1);

    if (engagement.length === 0) {
      throw new Error(`Engagement ${engagementId} not found`);
    }

    const eng = engagement[0];

    // Prepare content for embedding
    const additionalFields: Record<string, string> = {
      client: eng.clientName,
      status: eng.status,
    };
    if (eng.techTags) {
      additionalFields['tech tags'] = eng.techTags;
    }

    const content = prepareContent(
      eng.name,
      eng.description || undefined,
      additionalFields
    );

    // Generate content hash
    const contentHash = generateContentHash(content);

    // Check if embedding already exists with same hash
    const existingEmbedding = await db
      .select()
      .from(engagementEmbeddings)
      .where(eq(engagementEmbeddings.engagementId, engagementId))
      .limit(1);

    if (existingEmbedding.length > 0 && existingEmbedding[0].contentHash === contentHash) {
      console.log(`[Embeddings] Engagement ${engagementId} unchanged, skipping`);
      return null; // No changes, skip re-embedding
    }

    // Generate embedding
    console.log(`[Embeddings] Generating embedding for engagement ${engagementId}...`);
    const embedding = await generateEmbedding(content);

    // Prepare metadata
    const metadata = createEmbeddingMetadata({
      engagementId,
      engagementName: eng.name,
      contentLength: content.length,
    });

    const now = new Date().toISOString();

    // Store or update embedding
    if (existingEmbedding.length > 0) {
      // Update existing
      await db
        .update(engagementEmbeddings)
        .set({
          contentHash,
          embeddingJson: JSON.stringify(embedding),
          dimensions: EMBEDDING_DIMENSIONS,
          metadata,
          updatedAt: now,
        })
        .where(eq(engagementEmbeddings.id, existingEmbedding[0].id));

      console.log(`[Embeddings] Updated embedding for engagement ${engagementId}`);
      return existingEmbedding[0].id;
    } else {
      // Insert new
      const result = await db
        .insert(engagementEmbeddings)
        .values({
          engagementId,
          contentHash,
          embeddingJson: JSON.stringify(embedding),
          dimensions: EMBEDDING_DIMENSIONS,
          metadata,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: engagementEmbeddings.id });

      console.log(`[Embeddings] Created new embedding for engagement ${engagementId}`);
      return result[0].id;
    }
  } catch (error) {
    console.error(`[Embeddings] Error embedding engagement ${engagementId}:`, error);
    throw error;
  }
}

/**
 * Generate and store embedding for a signal
 * Returns the embedding ID if successful, or null if skipped (no changes)
 */
export async function embedSignal(signalId: number): Promise<number | null> {
  try {
    // Fetch signal data
    const signal = await db
      .select()
      .from(signals)
      .where(eq(signals.id, signalId))
      .limit(1);

    if (signal.length === 0) {
      throw new Error(`Signal ${signalId} not found`);
    }

    const sig = signal[0];

    // Prepare content for embedding
    const additionalFields: Record<string, string> = {
      status: sig.status,
      urgency: sig.urgency,
    };
    if (sig.requiredSkills) {
      additionalFields['required skills'] = sig.requiredSkills;
    }
    if (sig.resolutionSummary) {
      additionalFields['resolution summary'] = sig.resolutionSummary;
    }

    const content = prepareContent(
      sig.title,
      sig.description,
      additionalFields
    );

    // Generate content hash
    const contentHash = generateContentHash(content);

    // Check if embedding already exists with same hash
    const existingEmbedding = await db
      .select()
      .from(signalEmbeddings)
      .where(eq(signalEmbeddings.signalId, signalId))
      .limit(1);

    if (existingEmbedding.length > 0 && existingEmbedding[0].contentHash === contentHash) {
      console.log(`[Embeddings] Signal ${signalId} unchanged, skipping`);
      return null; // No changes, skip re-embedding
    }

    // Generate embedding
    console.log(`[Embeddings] Generating embedding for signal ${signalId}...`);
    const embedding = await generateEmbedding(content);

    // Prepare metadata
    const metadata = createEmbeddingMetadata({
      signalId,
      signalTitle: sig.title,
      engagementId: sig.engagementId,
      contentLength: content.length,
    });

    const now = new Date().toISOString();

    // Store or update embedding
    if (existingEmbedding.length > 0) {
      // Update existing
      await db
        .update(signalEmbeddings)
        .set({
          contentHash,
          embeddingJson: JSON.stringify(embedding),
          dimensions: EMBEDDING_DIMENSIONS,
          metadata,
          updatedAt: now,
        })
        .where(eq(signalEmbeddings.id, existingEmbedding[0].id));

      console.log(`[Embeddings] Updated embedding for signal ${signalId}`);
      return existingEmbedding[0].id;
    } else {
      // Insert new
      const result = await db
        .insert(signalEmbeddings)
        .values({
          signalId,
          contentHash,
          embeddingJson: JSON.stringify(embedding),
          dimensions: EMBEDDING_DIMENSIONS,
          metadata,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: signalEmbeddings.id });

      console.log(`[Embeddings] Created new embedding for signal ${signalId}`);
      return result[0].id;
    }
  } catch (error) {
    console.error(`[Embeddings] Error embedding signal ${signalId}:`, error);
    throw error;
  }
}

/**
 * Batch embed all engagements
 * Useful for initial data population or bulk refresh
 */
export async function embedAllEngagements(): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  const allEngagements = await db.select({ id: engagements.id }).from(engagements);

  const stats = {
    total: allEngagements.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  console.log(`[Embeddings] Batch embedding ${stats.total} engagements...`);

  for (const eng of allEngagements) {
    try {
      const existingCount = await db
        .select()
        .from(engagementEmbeddings)
        .where(eq(engagementEmbeddings.engagementId, eng.id))
        .limit(1);

      const hadExisting = existingCount.length > 0;

      const result = await embedEngagement(eng.id);

      if (result === null) {
        stats.skipped++;
      } else if (hadExisting) {
        stats.updated++;
      } else {
        stats.created++;
      }
    } catch (error) {
      console.error(`[Embeddings] Failed to embed engagement ${eng.id}:`, error);
      stats.errors++;
    }
  }

  console.log(`[Embeddings] Batch complete:`, stats);
  return stats;
}

/**
 * Batch embed all signals
 * Useful for initial data population or bulk refresh
 */
export async function embedAllSignals(): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  const allSignals = await db.select({ id: signals.id }).from(signals);

  const stats = {
    total: allSignals.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  console.log(`[Embeddings] Batch embedding ${stats.total} signals...`);

  for (const sig of allSignals) {
    try {
      const existingCount = await db
        .select()
        .from(signalEmbeddings)
        .where(eq(signalEmbeddings.signalId, sig.id))
        .limit(1);

      const hadExisting = existingCount.length > 0;

      const result = await embedSignal(sig.id);

      if (result === null) {
        stats.skipped++;
      } else if (hadExisting) {
        stats.updated++;
      } else {
        stats.created++;
      }
    } catch (error) {
      console.error(`[Embeddings] Failed to embed signal ${sig.id}:`, error);
      stats.errors++;
    }
  }

  console.log(`[Embeddings] Batch complete:`, stats);
  return stats;
}
