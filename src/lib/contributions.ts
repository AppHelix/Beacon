/**
 * Helper utility for logging contribution events
 * Used across API routes to track user collaboration actions
 */

import { db } from '@/db/client';
import { contributions } from '@/db/schema';
import { checkAndAwardBadges } from './badges';

export interface ContributionEvent {
  userId: string;
  userName: string;
  actionType: 'signal_created' | 'hand_raise' | 'suggestion' | 'signal_resolved' | 'team_joined';
  entityType: 'signal' | 'engagement' | 'user';
  entityId: number;
  entityTitle?: string;
  metadata?: Record<string, any>;
  points?: number;
}

/**
 * Log a contribution event to the database
 * Returns the created contribution record or null if failed
 */
export async function logContribution(event: ContributionEvent): Promise<any | null> {
  try {
    // Calculate points if not provided
    const contributionPoints = event.points ?? getDefaultPoints(event.actionType);

    const [contribution] = await db
      .insert(contributions)
      .values({
        userId: event.userId,
        userName: event.userName,
        actionType: event.actionType,
        entityType: event.entityType,
        entityId: event.entityId,
        entityTitle: event.entityTitle || null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        points: contributionPoints,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Check and award badges (async, don't await to avoid blocking)
    checkAndAwardBadges(event.userId, event.userName).catch((err) => {
      console.error('Badge check failed:', err);
    });

    return contribution;
  } catch (error) {
    console.error('Failed to log contribution:', error, event);
    // Don't throw - contribution tracking failures shouldn't break main operations
    return null;
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
