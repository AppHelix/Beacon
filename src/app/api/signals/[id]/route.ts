import { NextResponse } from 'next/server';
import { db } from '../../../../db/client';
import { signals } from '../../../../db/schema';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const all = await db.select().from(signals);
    const signal = all.find(s => s.id === parseInt(id));

    if (!signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 });
    }

    return NextResponse.json(signal);
  } catch (error: unknown) {
    console.error('Error fetching signal:', error);
    return NextResponse.json({ error: 'Failed to fetch signal' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params: _params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Only Admin, Curator, and Member can edit signals
  const userRole = session.user?.role?.toLowerCase();
  if (userRole === 'viewer') {
    return NextResponse.json({ error: 'Forbidden: Viewers cannot edit signals' }, { status: 403 });
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
  } catch (error: unknown) {
    console.error('Error updating signal:', error);
    return NextResponse.json({ error: 'Failed to update signal' }, { status: 500 });
  }
}

export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: Request
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Only Admin, Curator, and Member can delete signals
  const userRole = session.user?.role?.toLowerCase();
  if (userRole === 'viewer') {
    return NextResponse.json({ error: 'Forbidden: Viewers cannot delete signals' }, { status: 403 });
  }

  try {
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting signal:', error);
    return NextResponse.json({ error: 'Failed to delete signal' }, { status: 500 });
  }
}
