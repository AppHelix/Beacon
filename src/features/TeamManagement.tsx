// src/features/TeamManagement.tsx
"use client";
import React, { useState } from 'react';

const initialTeam = ["Alice", "Bob"];
const allPeople = ["Alice", "Bob", "Carol", "Dave"];

export default function TeamManagement() {
  const [team, setTeam] = useState<string[]>(initialTeam);
  const [selected, setSelected] = useState("");

  const addMember = () => {
    if (selected && !team.includes(selected)) {
      setTeam([...team, selected]);
      setSelected("");
    }
  };

  const removeMember = (name: string) => {
    setTeam(team.filter(m => m !== name));
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Team Management</h2>
      <div className="mb-2">Current Team:</div>
      <ul className="mb-4">
        {team.map((m, i) => (
          <li key={i} className="flex gap-2 items-center mb-1">
            <span>{m}</span>
            <button onClick={() => removeMember(m)} className="text-red-500">Remove</button>
          </li>
        ))}
      </ul>
      <select value={selected} onChange={e => setSelected(e.target.value)} className="p-2 border rounded">
        <option value="">Select member...</option>
        {allPeople.filter(p => !team.includes(p)).map((p, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>
      <button onClick={addMember} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">Add</button>
    </div>
  );
}
