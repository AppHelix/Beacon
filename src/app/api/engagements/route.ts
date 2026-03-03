import { NextResponse } from "next/server";

export async function GET() {
  // Mock data for engagements
  const mockEngagements = [
    {
      id: "1",
      name: "Project Apollo",
      clientName: "LunarTech",
      status: "Active",
      description: "Developing a lunar exploration module.",
    },
    {
      id: "2",
      name: "Project Mars",
      clientName: "RedPlanet Inc.",
      status: "Completed",
      description: "Terraforming Mars for human habitation.",
    },
  ];

  return NextResponse.json(mockEngagements);
}