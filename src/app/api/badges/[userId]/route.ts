import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserBadges, BADGES } from '@/lib/badges';

/**
 * GET /api/badges/[userId]
 * Get all badges earned by a user
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
    const earnedBadges = await getUserBadges(userId);

    return NextResponse.json({
      userId,
      badges: earnedBadges,
      totalBadges: earnedBadges.length,
      availableBadges: BADGES.length,
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}
