import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db/client';
import { contributions } from '@/db/schema';
import { desc, gte, sql, and } from 'drizzle-orm';

/**
 * GET /api/contributions/leaderboard
 * Get leaderboard with top contributors
 * Query params:
 *   - period: 'all', 'month', 'quarter', 'year' (default 'month')
 *   - limit: number of top contributors to return (default 10)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Calculate start date based on period
    const startDate = getStartDateForPeriod(period);

    // Build where condition
    const conditions = startDate ? [gte(contributions.createdAt, startDate)] : [];

    // Fetch all contributions in the period
    const allContributions = conditions.length > 0
      ? await db
          .select()
          .from(contributions)
          .where(and(...conditions))
      : await db
          .select()
          .from(contributions);

    // Aggregate by user
    const userStatsMap = new Map<string, {
      userId: string;
      userName: string;
      totalPoints: number;
      totalContributions: number;
      byActionType: Record<string, number>;
    }>();

    allContributions.forEach((contribution) => {
      const existing = userStatsMap.get(contribution.userId);
      if (existing) {
        existing.totalPoints += contribution.points;
        existing.totalContributions += 1;
        existing.byActionType[contribution.actionType] = 
          (existing.byActionType[contribution.actionType] || 0) + 1;
      } else {
        userStatsMap.set(contribution.userId, {
          userId: contribution.userId,
          userName: contribution.userName,
          totalPoints: contribution.points,
          totalContributions: 1,
          byActionType: { [contribution.actionType]: 1 },
        });
      }
    });

    // Convert to array and sort by points
    const leaderboard = Array.from(userStatsMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));

    return NextResponse.json({
      period,
      startDate: startDate || 'all-time',
      leaderboard,
      totalUsers: userStatsMap.size,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * Get start date based on period
 */
function getStartDateForPeriod(period: string): string | null {
  const now = new Date();
  
  switch (period) {
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return monthStart.toISOString();
    
    case 'quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const quarterStart = new Date(now.getFullYear(), quarterMonth, 1);
      return quarterStart.toISOString();
    
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return yearStart.toISOString();
    
    case 'all':
    default:
      return null;
  }
}
