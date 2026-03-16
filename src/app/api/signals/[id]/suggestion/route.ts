import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { signalSuggestions, signals } from '@/db/schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql, eq } from 'drizzle-orm';
import { logContribution } from '@/lib/contributions';

// GET: List all suggestions for a signal
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const signalId = parseInt(id);
    const suggestions = await db
      .select()
      .from(signalSuggestions)
      .where(sql`${signalSuggestions.signalId} = ${signalId}`);
    return NextResponse.json(suggestions);
  } catch (err) {
    console.error('Signal suggestion GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a suggestion for a signal
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only Admin, Curator, and Member can respond to signals
    const userRole = session.user?.role?.toLowerCase();
    if (userRole === 'viewer') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot respond to signals' }, { status: 403 });
    }

    const { id } = await params;
    const signalId = parseInt(id);
    const { suggestionText } = await req.json();
    const userEmail = session.user?.email;
    const userName = session.user?.name || 'Anonymous';
    if (!userEmail || !suggestionText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const inserted = await db.insert(signalSuggestions).values({
      signalId,
      userEmail,
      userName,
      suggestionText,
      createdAt: now,
    }).returning();

    // Get signal title for contribution log
    const signal = await db.select().from(signals).where(eq(signals.id, signalId)).limit(1);
    const signalTitle = signal[0]?.title || `Signal #${signalId}`;

    // Log contribution event
    await logContribution({
      userId: userEmail,
      userName,
      actionType: 'suggestion',
      entityType: 'signal',
      entityId: signalId,
      entityTitle: signalTitle,
    });

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error('Signal suggestion POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
