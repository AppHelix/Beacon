import { NextResponse } from 'next/server';
import { db } from '../../../db/client';
import { signals } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allSignals = await db.select().from(signals);
    return NextResponse.json(allSignals);
  } catch (error: unknown) {
    console.error('Error fetching signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, engagementId, createdBy, status, urgency, requiredSkills, resolutionSummary } = body;

    if (!title || !description || !engagementId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, engagementId, createdBy' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newSignal = await db
      .insert(signals)
      .values({
        title,
        description,
        engagementId,
        createdBy,
        status: status || 'open',
        urgency: urgency || 'medium',
        requiredSkills: requiredSkills ? JSON.stringify(requiredSkills) : null,
        resolutionSummary: resolutionSummary || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newSignal[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating signal:', error);
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, status, urgency, requiredSkills, resolutionSummary } = body;
    console.log('PUT /api/signals body:', body);
    console.log('PUT /api/signals id:', id, 'type:', typeof id);

    if (!id) {
      return NextResponse.json({ error: 'Missing signal id' }, { status: 400 });
    }

    const updated = await db
      .update(signals)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(urgency !== undefined && { urgency }),
        ...(requiredSkills !== undefined && { requiredSkills: JSON.stringify(requiredSkills) }),
        ...(resolutionSummary !== undefined && { resolutionSummary }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(signals.id, Number(id)))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating signal:', error.message, error.stack);
    } else {
      console.error('Error updating signal:', error);
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update signal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing signal id' }, { status: 400 });
    }

    const deleted = await db.delete(signals).returning();

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting signal:', error);
    return NextResponse.json({ error: 'Failed to delete signal' }, { status: 500 });
  }
}
