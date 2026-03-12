import { db } from '@/db/client';
import { signalHandRaises } from '@/db/schema';

export async function getHandRaises(signalId: number) {
  return db.select().from(signalHandRaises).where({ signalId });
}

export async function addHandRaise(signalId: number, userId: number, userName: string) {
  const now = new Date().toISOString();
  // Prevent duplicate hand-raises by same user for same signal
  const existing = await db.select().from(signalHandRaises).where({ signalId, userId });
  if (existing.length > 0) return null;
  const inserted = await db.insert(signalHandRaises).values({ signalId, userId, userName, createdAt: now }).returning();
  return inserted[0];
}
