import { db } from '@/db/client';
import { signalHandRaises } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Get all hand raises for a signal
export async function getHandRaises(signalId: number) {
  return db.select().from(signalHandRaises).where(eq(signalHandRaises.signalId, signalId));
}

// Add a hand raise for a signal by a user, preventing duplicates
export async function addHandRaise(signalId: number, userEmail: string, userName: string) {
  const now = new Date().toISOString();
  // Prevent duplicate hand-raises by same user for same signal
  const existing = await db.select().from(signalHandRaises).where(
    and(
      eq(signalHandRaises.signalId, signalId),
      eq(signalHandRaises.userEmail, userEmail)
    )
  );
  if (existing.length > 0) return null;
  const inserted = await db.insert(signalHandRaises).values({
    signalId,
    userEmail,
    userName,
    createdAt: now
  }).returning();
  return inserted[0];
}
