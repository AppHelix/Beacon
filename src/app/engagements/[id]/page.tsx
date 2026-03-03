"use client";
import React, { useState } from "react";

interface Engagement {
  id: string;
  name: string;
  clientName: string;
  status: string;
  description: string;
  team: string[];
  signals: string[];
  activityLog: string[];
}

const fetchEngagement = async (id: string): Promise<Engagement> => {
  const res = await fetch(`/api/engagements/${id}`);
  return res.json();
};

export default function EngagementDetail({ params }: { params: { id: string } }) {
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  React.useEffect(() => {
    fetchEngagement(params.id).then(setEngagement);
  }, [params.id]);

  if (!engagement) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{engagement.name}</h1>
      <div className="tabs mb-4">
        {["Overview", "Team", "Signals", "Activity Log"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        {activeTab === "Overview" && <p>{engagement.description}</p>}
        {activeTab === "Team" && (
          <ul>
            {engagement.team.map((member, i) => (
              <li key={i}>{member}</li>
            ))}
          </ul>
        )}
        {activeTab === "Signals" && (
          <ul>
            {engagement.signals.map((signal, i) => (
              <li key={i}>{signal}</li>
            ))}
          </ul>
        )}
        {activeTab === "Activity Log" && (
          <ul>
            {engagement.activityLog.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}