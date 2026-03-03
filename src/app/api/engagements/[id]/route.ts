import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Mock data for a single engagement
  const mockEngagement = {
    id,
    name: "Project Apollo",
    clientName: "LunarTech",
    status: "Active",
    description: "Developing a lunar exploration module.",
    team: ["Alice", "Bob"],
    signals: ["Signal 1", "Signal 2"],
    activityLog: ["Created engagement", "Updated status to Active"],
  };

  return NextResponse.json(mockEngagement);
}