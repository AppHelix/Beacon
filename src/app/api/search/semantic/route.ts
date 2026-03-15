/**
 * Semantic Search API
 * 
 * GET /api/search/semantic?q=query&type=engagements|signals|all
 * 
 * Performs semantic search across engagements and/or signals using embeddings.
 * Returns results ranked by similarity score.
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - type: 'engagements' | 'signals' | 'all' (default: 'all')
 * - limit: Maximum results per type (default: 10, max: 50)
 * - minSimilarity: Minimum similarity threshold 0-1 (default: 0.5)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  findSimilarEngagements,
  findSimilarSignals,
  findRelatedContent,
} from '@/lib/retrieval';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limitParam = searchParams.get('limit');
    const minSimilarityParam = searchParams.get('minSimilarity');

    // Validate required parameters
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: q (query)' },
        { status: 400 }
      );
    }

    // Parse and validate optional parameters
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam), 1), 50) : 10;
    const minSimilarity = minSimilarityParam
      ? Math.min(Math.max(parseFloat(minSimilarityParam), 0), 1)
      : 0.5;

    // Validate type parameter
    if (!['engagements', 'signals', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be: engagements, signals, or all' },
        { status: 400 }
      );
    }

    console.log(`[API] Semantic search: query="${query}", type=${type}, limit=${limit}, minSimilarity=${minSimilarity}`);

    // Perform search based on type
    let results;

    if (type === 'engagements') {
      const engagements = await findSimilarEngagements(query, limit, minSimilarity);
      results = {
        query,
        type,
        results: {
          engagements,
        },
        metadata: {
          totalResults: engagements.length,
          limit,
          minSimilarity,
        },
      };
    } else if (type === 'signals') {
      const signals = await findSimilarSignals(query, limit, minSimilarity);
      results = {
        query,
        type,
        results: {
          signals,
        },
        metadata: {
          totalResults: signals.length,
          limit,
          minSimilarity,
        },
      };
    } else {
      // type === 'all'
      const related = await findRelatedContent(query, {
        engagementLimit: limit,
        signalLimit: limit,
        minSimilarity,
      });
      results = {
        query,
        type,
        results: {
          engagements: related.engagements,
          signals: related.signals,
        },
        metadata: {
          totalResults: related.engagements.length + related.signals.length,
          engagementCount: related.engagements.length,
          signalCount: related.signals.length,
          limit,
          minSimilarity,
        },
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Semantic search error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
