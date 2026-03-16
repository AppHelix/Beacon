/**
 * Badge system definitions and award logic
 * Badges are earned based on contribution milestones and achievements
 */

import { db } from '@/db/client';
import { userBadges, contributions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  color: string; // Tailwind color class
  criteria: {
    type: 'contribution_count' | 'points_total' | 'action_type_count' | 'special';
    threshold?: number;
    actionType?: string;
  };
}

/**
 * All available badges in the system
 */
export const BADGES: Badge[] = [
  // First-time achievements
  {
    id: 'first_signal',
    name: 'First Signal',
    description: 'Created your first signal',
    icon: '🎯',
    color: 'bg-blue-100 text-blue-700',
    criteria: { type: 'action_type_count', actionType: 'signal_created', threshold: 1 },
  },
  {
    id: 'first_hand_raise',
    name: 'Helping Hand',
    description: 'Raised your hand to help',
    icon: '✋',
    color: 'bg-yellow-100 text-yellow-700',
    criteria: { type: 'action_type_count', actionType: 'hand_raise', threshold: 1 },
  },
  {
    id: 'first_suggestion',
    name: 'Idea Generator',
    description: 'Made your first suggestion',
    icon: '💡',
    color: 'bg-green-100 text-green-700',
    criteria: { type: 'action_type_count', actionType: 'suggestion', threshold: 1 },
  },
  {
    id: 'first_resolution',
    name: 'Problem Solver',
    description: 'Resolved your first signal',
    icon: '✅',
    color: 'bg-purple-100 text-purple-700',
    criteria: { type: 'action_type_count', actionType: 'signal_resolved', threshold: 1 },
  },

  // Contribution milestones
  {
    id: 'contributor_10',
    name: 'Active Contributor',
    description: 'Made 10 contributions',
    icon: '🌟',
    color: 'bg-indigo-100 text-indigo-700',
    criteria: { type: 'contribution_count', threshold: 10 },
  },
  {
    id: 'contributor_25',
    name: 'Dedicated Contributor',
    description: 'Made 25 contributions',
    icon: '⭐',
    color: 'bg-indigo-100 text-indigo-700',
    criteria: { type: 'contribution_count', threshold: 25 },
  },
  {
    id: 'contributor_50',
    name: 'Super Contributor',
    description: 'Made 50 contributions',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-700',
    criteria: { type: 'contribution_count', threshold: 50 },
  },

  // Points milestones
  {
    id: 'points_100',
    name: 'Rising Star',
    description: 'Earned 100 points',
    icon: '🌠',
    color: 'bg-pink-100 text-pink-700',
    criteria: { type: 'points_total', threshold: 100 },
  },
  {
    id: 'points_500',
    name: 'Beacon Elite',
    description: 'Earned 500 points',
    icon: '💎',
    color: 'bg-cyan-100 text-cyan-700',
    criteria: { type: 'points_total', threshold: 500 },
  },
  {
    id: 'points_1000',
    name: 'Legend',
    description: 'Earned 1000 points',
    icon: '👑',
    color: 'bg-yellow-100 text-yellow-700',
    criteria: { type: 'points_total', threshold: 1000 },
  },

  // Signal specialist badges
  {
    id: 'signal_creator_10',
    name: 'Signal Expert',
    description: 'Created 10 signals',
    icon: '📡',
    color: 'bg-blue-100 text-blue-700',
    criteria: { type: 'action_type_count', actionType: 'signal_created', threshold: 10 },
  },
  {
    id: 'resolver_5',
    name: 'Solution Specialist',
    description: 'Resolved 5 signals',
    icon: '🎓',
    color: 'bg-purple-100 text-purple-700',
    criteria: { type: 'action_type_count', actionType: 'signal_resolved', threshold: 5 },
  },
  {
    id: 'collaborator_10',
    name: 'Team Player',
    description: 'Raised hand or suggested on 10 signals',
    icon: '🤝',
    color: 'bg-green-100 text-green-700',
    criteria: { type: 'special' }, // Custom logic needed
  },
];

/**
 * Check if a user has already earned a badge
 */
async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
    .limit(1);
  
  return existing.length > 0;
}

/**
 * Award a badge to a user
 */
async function awardBadge(userId: string, userName: string, badgeId: string): Promise<boolean> {
  try {
    // Check if already has badge
    if (await hasUserBadge(userId, badgeId)) {
      return false;
    }

    // Award the badge
    await db.insert(userBadges).values({
      userId,
      userName,
      badgeId,
      awardedAt: new Date().toISOString(),
    });

    console.log(`✨ Badge awarded: ${badgeId} to ${userName}`);
    return true;
  } catch (error) {
    console.error(`Failed to award badge ${badgeId} to ${userId}:`, error);
    return false;
  }
}

/**
 * Check and award badges for a user based on their contributions
 * Call this after logging a new contribution
 */
export async function checkAndAwardBadges(userId: string, userName: string): Promise<string[]> {
  const awardedBadges: string[] = [];

  try {
    // Get user's contributions
    const userContributions = await db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, userId));

    // Calculate stats
    const totalContributions = userContributions.length;
    const totalPoints = userContributions.reduce((sum, c) => sum + c.points, 0);
    const byActionType: Record<string, number> = {};

    userContributions.forEach((c) => {
      byActionType[c.actionType] = (byActionType[c.actionType] || 0) + 1;
    });

    // Check each badge
    for (const badge of BADGES) {
      // Skip if already has badge
      if (await hasUserBadge(userId, badge.id)) {
        continue;
      }

      let shouldAward = false;

      switch (badge.criteria.type) {
        case 'contribution_count':
          shouldAward = totalContributions >= (badge.criteria.threshold || 0);
          break;

        case 'points_total':
          shouldAward = totalPoints >= (badge.criteria.threshold || 0);
          break;

        case 'action_type_count':
          const count = byActionType[badge.criteria.actionType || ''] || 0;
          shouldAward = count >= (badge.criteria.threshold || 0);
          break;

        case 'special':
          // Custom logic for special badges
          if (badge.id === 'collaborator_10') {
            const handRaises = byActionType['hand_raise'] || 0;
            const suggestions = byActionType['suggestion'] || 0;
            shouldAward = (handRaises + suggestions) >= 10;
          }
          break;
      }

      if (shouldAward) {
        const awarded = await awardBadge(userId, userName, badge.id);
        if (awarded) {
          awardedBadges.push(badge.id);
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }

  return awardedBadges;
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const earned = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const badgeIds = new Set(earned.map((b) => b.badgeId));
    return BADGES.filter((badge) => badgeIds.has(badge.id));
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Get badge definition by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === badgeId);
}
