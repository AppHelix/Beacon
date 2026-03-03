"use client";
import React, { useState, useEffect } from "react";

interface Engagement {
  id: string;
  name: string;
  clientName: string;
  status: string;
  description: string;
}

const fetchEngagements = async (): Promise<Engagement[]> => {
  const res = await fetch("/api/engagements");
  return res.json();
};

export default function EngagementCatalog() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEngagements().then(setEngagements);
  }, []);

  const filteredEngagements = filter
    ? engagements.filter(e =>
        e.name.toLowerCase().includes(filter.toLowerCase()) ||
        e.clientName.toLowerCase().includes(filter.toLowerCase())
      )
    : engagements;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Engagement Catalog</h1>
      <input
        type="text"
        placeholder="Filter by name or client..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="grid grid-cols-3 gap-4">
        {filteredEngagements.map(e => (
          <div key={e.id} className="p-4 border rounded shadow">
            <h2 className="font-bold text-lg">{e.name}</h2>
            <p className="text-sm text-gray-600">Client: {e.clientName}</p>
            <p className="text-sm">Status: {e.status}</p>
            <p className="text-xs text-gray-500">{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}