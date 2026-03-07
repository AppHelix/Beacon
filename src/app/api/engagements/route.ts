import { NextResponse } from "next/server";
import { db } from "../../../db/client";
import { engagements } from "../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const allEngagements = await db.select().from(engagements);
    return NextResponse.json(allEngagements);
  } catch (error: unknown) {
    console.error("Error fetching engagements:", error);
    return NextResponse.json({ error: "Failed to fetch engagements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, clientName, status, description, techTags } = body;

    if (!name || !clientName || !status) {
      return NextResponse.json(
        { error: "Missing required fields: name, clientName, status" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newEngagement = await db
      .insert(engagements)
      .values({
        name,
        clientName,
        status,
        description,
        techTags: techTags ? JSON.stringify(techTags) : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newEngagement[0], { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating engagement:", error);
    return NextResponse.json({ error: "Failed to create engagement" }, { status: 500 });
  }
}