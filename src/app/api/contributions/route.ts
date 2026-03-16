import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { contributions } from '@/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

/**
 * POST /api/contributions
 * Log a new contribution event
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { actionType, entityType, entityId, entityTitle, metadata, points } = body;

    // Validate required fields
    if (!actionType || !entityType || entityId === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: actionType, entityType, entityId' },
        { status: 400 }
      );
    }

    // Calculate points if not provided (default point values)
    const contributionPoints = points ?? getDefaultPoints(actionType);

    // Insert contribution record
    const [contribution] = await db
      .insert(contributions)
      .values({
        userId: session.user.email,
        userName: session.user.name || session.user.email,
        actionType,
        entityType,
        entityId,
        entityTitle: entityTitle || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        points: contributionPoints,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error('Error logging contribution:', error);
    return NextResponse.json(
      { error: 'Failed to log contribution' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contributions
 * Get contributions with optional filters
 * Query params:
 *   - userId: filter by user
 *   - actionType: filter by action type
 *   - entityType: filter by entity type
 *   - entityId: filter by entity ID
 *   - startDate: filter by start date (ISO string)
 *   - endDate: filter by end date (ISO string)
 *   - limit: number of results (default 50)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const actionType = searchParams.get('actionType');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where conditions
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(contributions.userId, userId));
    }
    if (actionType) {
      conditions.push(eq(contributions.actionType, actionType));
    }
    if (entityType) {
      conditions.push(eq(contributions.entityType, entityType));
    }
    if (entityId) {
      conditions.push(eq(contributions.entityId, parseInt(entityId)));
    }
    if (startDate) {
      conditions.push(gte(contributions.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(sql`${contributions.createdAt} <= ${endDate}`);
    }

    // Query contributions
    const result = conditions.length > 0
      ? await db
          .select()
          .from(contributions)
          .where(and(...conditions))
          .orderBy(desc(contributions.createdAt))
          .limit(limit)
      : await db
          .select()
          .from(contributions)
          .orderBy(desc(contributions.createdAt))
          .limit(limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}

/**
 * Get default point values for different action types
 */
function getDefaultPoints(actionType: string): number {
  const pointMap: Record<string, number> = {
    signal_created: 10,
    hand_raise: 5,
    suggestion: 5,
    signal_resolved: 20,
    team_joined: 3,
  };
  return pointMap[actionType] || 0;
}
