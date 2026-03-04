import { NextResponse } from "next/server";
import { db } from "../../../../db/client";
import { engagements } from "../../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const all = await db.select().from(engagements);
    const engagement = all.find(e => e.id === parseInt(params.id));

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    return NextResponse.json(engagement);
  } catch (error) {
    console.error("Error fetching engagement:", error);
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, clientName, status, description, techTags } = body;

    const updated = await db
      .update(engagements)
      .set({
        ...(name !== undefined && { name }),
        ...(clientName !== undefined && { clientName }),
        ...(status !== undefined && { status }),
        ...(description !== undefined && { description }),
        ...(techTags !== undefined && { techTags: JSON.stringify(techTags) }),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating engagement:", error);
    return NextResponse.json({ error: "Failed to update engagement" }, { status: 500 });
  }
}

export async function DELETE(_request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting engagement:", error);
    return NextResponse.json({ error: "Failed to delete engagement" }, { status: 500 });
  }
}