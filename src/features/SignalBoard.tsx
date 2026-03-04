"use client";
// src/features/SignalBoard.tsx
import React, { useEffect, useState } from 'react';
import { Signal } from '../db/signal';

const fetchSignals = async (): Promise<Signal[]> => {
  const res = await fetch('/api/signals');
  return res.json();
};

const statusColumns = [
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

export default function SignalBoard() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchSignals().then(setSignals);
  }, []);

  const filteredSignals = filter
    ? signals.filter(s =>
        s.title.toLowerCase().includes(filter.toLowerCase()) ||
        s.requiredSkills.some(skill => skill.toLowerCase().includes(filter.toLowerCase()))
      )
    : signals;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Signal Board</h2>
      <input
        type="text"
        placeholder="Filter by title or skill..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map(col => (
          <div key={col.key} className="bg-gray-100 p-2 rounded">
            <h3 className="font-semibold mb-2">{col.label}</h3>
            {filteredSignals
              .filter(s => s.status === col.key)
              .map(s => (
                <div key={s.id} className="bg-white p-2 mb-2 rounded shadow">
                  <div className="font-bold">{s.title}</div>
                  <div className="text-sm text-gray-600">Urgency: {s.urgency}</div>
                  <div className="text-xs">Skills: {s.requiredSkills.join(', ')}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
