"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

interface Signal {
  id: number;
  title: string;
  description: string;
  engagementId: number;
  createdBy: string;
  status: string;
  urgency: string;
  requiredSkills?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchSignals = async (): Promise<Signal[]> => {
  try {
    const res = await fetch("/api/signals");
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    return [];
  }
};

export default function SignalBoard() {
  const { data: session, status } = useSession();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchSignals()
      .then(setSignals)
      .finally(() => setIsLoading(false));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Signal Board</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view signals.</p>
          <button
            onClick={() => signIn("azure-ad")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const filteredSignals = signals.filter(signal => {
    const matchesStatus = !statusFilter || signal.status === statusFilter;
    const matchesUrgency = !urgencyFilter || signal.urgency === urgencyFilter;
    return matchesStatus && matchesUrgency;
  });

  const statusOptions = Array.from(new Set(signals.map(s => s.status)));
  const urgencyOptions = ["low", "medium", "high"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Signal Board</h1>
        <p className="text-gray-600">Track and collaborate on project signals and issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={e => setUrgencyFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Urgency</option>
          {urgencyOptions.map(urgency => (
            <option key={urgency} value={urgency}>
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded shadow-md">
        {isLoading && <p className="p-6 text-gray-600">Loading signals...</p>}

        {!isLoading && filteredSignals.length === 0 && (
          <p className="p-6 text-gray-600">No signals found.</p>
        )}

        {!isLoading && filteredSignals.length > 0 && (
          <div className="divide-y">
            {filteredSignals.map(signal => (
              <div key={signal.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{signal.title}</h3>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(signal.status)}`}>
                      {signal.status.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(signal.urgency)}`}>
                      {signal.urgency}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                <p className="text-xs text-gray-500">
                  Created by: {signal.createdBy} • Engagement: {signal.engagementId}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
