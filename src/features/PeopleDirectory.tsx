// src/features/PeopleDirectory.tsx
"use client";
import React, { useState } from 'react';

const people = [
  { name: "Alice", skills: ["React", "TypeScript"] },
  { name: "Bob", skills: ["Node.js", "PostgreSQL"] },
  { name: "Carol", skills: ["Tailwind", "UI Design"] },
   { name: "Carie", skills: ["React", "UI Design"] }
];

export default function PeopleDirectory() {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? people.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.skills.some(skill => skill.toLowerCase().includes(filter.toLowerCase()))
      )
    : people;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">People Directory</h2>
      <input
        type="text"
        placeholder="Filter by name or skill..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <ul>
        {filtered.map((p, i) => (
          <li key={i} className="mb-2">
            <span className="font-semibold">{p.name}</span> — <span className="text-xs">{p.skills.join(", ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
