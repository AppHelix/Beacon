"use client";
// src/features/SignalDetail.tsx
import React, { useState } from 'react';
import { Signal } from '../db/signal';

interface SignalDetailProps {
  signal: Signal;
}

export default function SignalDetail({ signal }: SignalDetailProps) {
  const [responses, setResponses] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addResponse = () => {
    if (input.trim()) {
      setResponses([...responses, input]);
      setInput("");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{signal.title}</h2>
      <div className="mb-2 text-gray-700">{signal.description}</div>
      <div className="mb-2 text-xs">Skills: {signal.requiredSkills.join(", ")}</div>
      <div className="mb-4 text-sm">Status: {signal.status}</div>
      <h3 className="font-semibold mb-2">Responses</h3>
      <ul className="mb-2">
        {responses.map((r, i) => (
          <li key={i} className="bg-gray-100 p-2 mb-1 rounded">{r}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a response..."
          className="p-2 border rounded w-full"
        />
        <button onClick={addResponse} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
