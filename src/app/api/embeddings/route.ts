/**
 * Embeddings API
 * 
 * POST /api/embeddings
 * 
 * Trigger embedding generation for engagements or signals.
 * Supports single entity or batch operations.
 * 
 * Request body:
 * - type: 'engagement' | 'signal' | 'all'
 * - id?: number (required for single entity)
 * - engagementIds?: number[] (for batch engagements)
 * - signalIds?: number[] (for batch signals)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  embedEngagement,
  embedSignal,
  embedAllEngagements,
  embedAllSignals,
} from '@/lib/embedding-service';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and curators can trigger embeddings
    const userRole = session.user.role?.toLowerCase();
    if (!userRole || !['admin', 'curator'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Curator role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, id, engagementIds, signalIds } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    // Handle single engagement
    if (type === 'engagement' && id) {
      const embeddingId = await embedEngagement(id);
      return NextResponse.json({
        success: true,
        type: 'engagement',
        id,
        embeddingId,
        skipped: embeddingId === null,
      });
    }

    // Handle single signal
    if (type === 'signal' && id) {
      const embeddingId = await embedSignal(id);
      return NextResponse.json({
        success: true,
        type: 'signal',
        id,
        embeddingId,
        skipped: embeddingId === null,
      });
    }

    // Handle batch engagements
    if (type === 'engagement' && engagementIds && Array.isArray(engagementIds)) {
      const results = [];
      for (const engId of engagementIds) {
        try {
          const embeddingId = await embedEngagement(engId);
          results.push({ id: engId, success: true, embeddingId });
        } catch (error) {
          results.push({
            id: engId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      return NextResponse.json({
        success: true,
        type: 'engagement',
        batch: true,
        results,
      });
    }

    // Handle batch signals
    if (type === 'signal' && signalIds && Array.isArray(signalIds)) {
      const results = [];
      for (const sigId of signalIds) {
        try {
          const embeddingId = await embedSignal(sigId);
          results.push({ id: sigId, success: true, embeddingId });
        } catch (error) {
          results.push({
            id: sigId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      return NextResponse.json({
        success: true,
        type: 'signal',
        batch: true,
        results,
      });
    }

    // Handle "all engagements"
    if (type === 'all' || type === 'all-engagements') {
      const stats = await embedAllEngagements();
      return NextResponse.json({
        success: true,
        type: 'all-engagements',
        stats,
      });
    }

    // Handle "all signals"
    if (type === 'all-signals') {
      const stats = await embedAllSignals();
      return NextResponse.json({
        success: true,
        type: 'all-signals',
        stats,
      });
    }

    // Handle "everything"
    if (type === 'all') {
      const engagementStats = await embedAllEngagements();
      const signalStats = await embedAllSignals();
      return NextResponse.json({
        success: true,
        type: 'all',
        stats: {
          engagements: engagementStats,
          signals: signalStats,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid request: missing or invalid parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Embeddings error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/embeddings
 * 
 * Check embedding status for entities
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and id' },
        { status: 400 }
      );
    }

    // Import here to avoid circular dependencies
    const { db } = await import('@/db/client');
    const { engagementEmbeddings, signalEmbeddings } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    if (type === 'engagement') {
      const embeddings = await db
        .select()
        .from(engagementEmbeddings)
        .where(eq(engagementEmbeddings.engagementId, parseInt(id)))
        .limit(1);

      return NextResponse.json({
        hasEmbedding: embeddings.length > 0,
        embedding: embeddings[0] || null,
      });
    }

    if (type === 'signal') {
      const embeddings = await db
        .select()
        .from(signalEmbeddings)
        .where(eq(signalEmbeddings.signalId, parseInt(id)))
        .limit(1);

      return NextResponse.json({
        hasEmbedding: embeddings.length > 0,
        embedding: embeddings[0] || null,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('[API] Embeddings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
