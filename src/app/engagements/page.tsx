"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

interface Engagement {
  id: number;
  name: string;
  clientName: string;
  status: string;
  description?: string;
  techTags?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchEngagements = async (): Promise<Engagement[]> => {
  try {
    const res = await fetch("/api/engagements", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized - please log in");
      }
      throw new Error("Failed to fetch engagements");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return [];
  }
};

export default function EngagementCatalog() {
  const { data: session, status } = useSession();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchEngagements()
      .then(setEngagements)
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
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
          <h1 className="text-4xl font-bold text-white mb-4">Engagement Catalog</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view engagements.</p>
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

  const filteredEngagements = engagements.filter(e => {
    const matchesSearch =
      !filter ||
      e.name.toLowerCase().includes(filter.toLowerCase()) ||
      e.clientName.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = Array.from(new Set(engagements.map(e => e.status)));

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Engagement Catalog</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by name or client..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-600">Loading engagement data...</p>}

      {!isLoading && filteredEngagements.length === 0 && !error && (
        <p className="text-gray-600">No engagements found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEngagements.map(e => (
          <div key={e.id} className="p-4 border rounded shadow hover:shadow-lg bg-white">
            <h2 className="font-bold text-lg mb-1">{e.name}</h2>
            <p className="text-sm text-gray-600 mb-2">Client: {e.clientName}</p>
            <p className="text-sm mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                e.status === 'Active' ? 'bg-green-100 text-green-700' :
                e.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {e.status}
              </span>
            </p>
            {e.description && <p className="text-xs text-gray-500 mb-2">{e.description}</p>}
            {e.techTags && (
              <p className="text-xs text-gray-500">
                Tags: {e.techTags}
              </p>
            )}
            <a
              href={`/engagements/${e.id}`}
              className="mt-4 block text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}