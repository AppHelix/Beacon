import { NextResponse } from 'next/server';
import { db } from '../../../../db/client';
import { signals } from '../../../../db/schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function GET(_request: Request, { _params }: { _params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const all = await db.select().from(signals);
    const signal = all.filter(s => s.id === parseInt(_params.id));

    if (!signal || signal.length === 0) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json(signal[0]);
  } catch (error) {
    console.error('Error fetching signal:', error);
    return NextResponse.json({ error: 'Failed to fetch signal' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { _params }: { _params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, status, urgency, requiredSkills } = body;

    const updated = await db
      .update(signals)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(urgency !== undefined && { urgency }),
        ...(requiredSkills !== undefined && { requiredSkills: JSON.stringify(requiredSkills) }),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating signal:', error);
    return NextResponse.json({ error: 'Failed to update signal' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { _params }: { _params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await db.delete(signals).returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting signal:', error);
    return NextResponse.json({ error: 'Failed to delete signal' }, { status: 500 });
  }
}
