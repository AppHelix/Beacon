import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { signalSuggestions } from '@/db/schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from 'drizzle-orm';

// GET: List all suggestions for a signal
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const signalId = parseInt(params.id);
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
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const signalId = parseInt(params.id);
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
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    console.error('Signal suggestion POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
