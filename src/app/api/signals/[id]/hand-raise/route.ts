import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { signalHandRaises } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: List all hand-raises for a signal
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const signalId = parseInt(id);
    const handRaises = await db
      .select()
      .from(signalHandRaises)
      .where(sql`${signalHandRaises.signalId} = ${signalId}`);
    return NextResponse.json(handRaises);
  } catch (err) {
    console.error('Hand-raise GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add a hand-raise for a signal
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('Hand-raise POST error: No session', { session });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only Admin, Curator, and Member can respond to signals
    const userRole = session.user?.role?.toLowerCase();
    if (userRole === 'viewer') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot respond to signals' }, { status: 403 });
    }

    const { id } = await params;
    const signalId = parseInt(id);
    const userEmail = session.user?.email;
    const userName = session.user?.name || 'Anonymous';
    if (!userEmail) {
      console.error('Hand-raise POST error: Session missing userEmail', { session });
      return NextResponse.json({ error: 'Session missing user email' }, { status: 400 });
    }
    const now = new Date().toISOString();
    // Prevent duplicate hand-raises by same user for same signal
    let existing: unknown[] = [];
    try {
      existing = await db
        .select()
        .from(signalHandRaises)
        .where(sql`${signalHandRaises.signalId} = ${signalId} AND ${signalHandRaises.userEmail} = ${userEmail}`);
    } catch (dbErr: unknown) {
      let errorMsg = 'Unknown error';
      if (typeof dbErr === 'object' && dbErr && 'message' in dbErr) {
        errorMsg = (dbErr as { message: string }).message;
      } else {
        errorMsg = String(dbErr);
      }
      console.error('Hand-raise POST error: DB select failed', dbErr, {
        signalId,
        userEmail,
        drizzleTable: signalHandRaises,
        drizzleSchema: Object.keys(signalHandRaises),
      });
      return NextResponse.json({ error: 'Database error (select)', details: errorMsg }, { status: 500 });
    }
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already raised' }, { status: 409 });
    }
    let inserted = [];
    try {
      inserted = await db.insert(signalHandRaises).values({ signalId, userEmail, userName, createdAt: now }).returning();
    } catch (dbErr) {
      console.error('Hand-raise POST error: DB insert failed', dbErr);
      return NextResponse.json({ error: 'Database error (insert)' }, { status: 500 });
    }
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error('Hand-raise POST error: Unexpected', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
