import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { contributions } from '@/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

/**
 * GET /api/contributions/[userId]
 * Get contribution history and stats for a specific user
 * Query params:
 *   - startDate: filter by start date (ISO string)
 *   - endDate: filter by end date (ISO string)
 *   - includeStats: include aggregated statistics (default true)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeStats = searchParams.get('includeStats') !== 'false';

    // Build where conditions
    const conditions = [eq(contributions.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(contributions.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(sql`${contributions.createdAt} <= ${endDate}`);
    }

    // Fetch user contributions
    const userContributions = await db
      .select()
      .from(contributions)
      .where(and(...conditions))
      .orderBy(desc(contributions.createdAt));

    // Calculate statistics if requested
    let stats = null;
    if (includeStats) {
      stats = calculateStats(userContributions);
    }

    return NextResponse.json({
      userId,
      contributions: userContributions,
      stats,
      total: userContributions.length,
    });
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user contributions' },
      { status: 500 }
    );
  }
}

/**
 * Calculate aggregated statistics from contribution records
 */
function calculateStats(contributions: any[]) {
  const stats = {
    totalPoints: 0,
    totalContributions: contributions.length,
    byActionType: {} as Record<string, number>,
    byEntityType: {} as Record<string, number>,
    recentActivity: [] as any[],
  };

  contributions.forEach((contribution) => {
    // Sum total points
    stats.totalPoints += contribution.points;

    // Count by action type
    stats.byActionType[contribution.actionType] = 
      (stats.byActionType[contribution.actionType] || 0) + 1;

    // Count by entity type
    stats.byEntityType[contribution.entityType] = 
      (stats.byEntityType[contribution.entityType] || 0) + 1;
  });

  // Get recent 10 activities
  stats.recentActivity = contributions.slice(0, 10).map((c) => ({
    actionType: c.actionType,
    entityType: c.entityType,
    entityId: c.entityId,
    entityTitle: c.entityTitle,
    points: c.points,
    createdAt: c.createdAt,
  }));

  return stats;
}
