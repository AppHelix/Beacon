/**
 * RAG Context API
 * 
 * GET /api/rag/context?q=query&maxTokens=2000
 * 
 * Retrieves relevant context for RAG (Retrieval Augmented Generation).
 * Used by AI assistant to ground responses in actual project data.
 * 
 * Query Parameters:
 * - q: Query/question (required)
 * - maxTokens: Maximum context tokens (default: 2000, max: 4000)
 * 
 * Returns:
 * - context: Formatted text context for RAG
 * - sources: Array of source documents with IDs and similarity scores
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRAGContext } from '@/lib/retrieval';

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
    const maxTokensParam = searchParams.get('maxTokens');

    // Validate required parameters
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: q (query)' },
        { status: 400 }
      );
    }

    // Parse and validate maxTokens
    const maxTokens = maxTokensParam
      ? Math.min(Math.max(parseInt(maxTokensParam), 100), 4000)
      : 2000;

    console.log(`[API] RAG context request: query="${query.substring(0, 50)}...", maxTokens=${maxTokens}`);

    // Get RAG context
    const result = await getRAGContext(query, maxTokens);

    return NextResponse.json({
      query,
      context: result.context,
      sources: result.sources,
      metadata: {
        sourceCount: result.sources.length,
        maxTokens,
        approximateTokens: Math.ceil(result.context.length / 4),
      },
    });
  } catch (error) {
    console.error('[API] RAG context error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
