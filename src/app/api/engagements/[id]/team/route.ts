import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { engagementTeamMembers, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List team members for an engagement
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const engagementId = Number(params.id);
  if (isNaN(engagementId)) return NextResponse.json({ error: 'Invalid engagement ID' }, { status: 400 });
  const members = await db.select({
    id: engagementTeamMembers.id,
    userId: engagementTeamMembers.userId,
    role: engagementTeamMembers.role,
    addedAt: engagementTeamMembers.addedAt,
    userName: users.name,
    userEmail: users.email,
  })
    .from(engagementTeamMembers)
    .leftJoin(users, eq(engagementTeamMembers.userId, users.id))
    .where(eq(engagementTeamMembers.engagementId, engagementId));
  return NextResponse.json(members);
}

// POST: Add a team member
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  if (!session || !session.user || !userRole || !["admin", "curator"].includes(userRole.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const engagementId = Number(params.id);
  if (isNaN(engagementId)) return NextResponse.json({ error: 'Invalid engagement ID' }, { status: 400 });
  const { userId, role } = await req.json();
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  const now = new Date().toISOString();
  // Prevent duplicate
  const existing = await db.select().from(engagementTeamMembers).where(and(eq(engagementTeamMembers.engagementId, engagementId), eq(engagementTeamMembers.userId, userId)));
  if (existing.length > 0) return NextResponse.json({ error: 'User already a member' }, { status: 409 });
  const inserted = await db.insert(engagementTeamMembers).values({ engagementId, userId, role: role || 'member', addedAt: now }).returning();
  return NextResponse.json(inserted[0]);
}

// DELETE: Remove a team member
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  if (!session || !session.user || !userRole || !["admin", "curator"].includes(userRole.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const engagementId = Number(params.id);
  if (isNaN(engagementId)) return NextResponse.json({ error: 'Invalid engagement ID' }, { status: 400 });
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  await db.delete(engagementTeamMembers).where(and(eq(engagementTeamMembers.engagementId, engagementId), eq(engagementTeamMembers.userId, userId)));
  return NextResponse.json({ success: true });
}
