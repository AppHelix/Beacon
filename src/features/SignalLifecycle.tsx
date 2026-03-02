// src/features/SignalLifecycle.tsx
"use client";
import React, { useState } from 'react';
import { Signal } from '../db/signal';

interface SignalLifecycleProps {
  signal: Signal;
  onStatusChange: (status: Signal["status"]) => void;
}

const statuses: Signal["status"][] = ["open", "in-progress", "resolved", "closed"];

export default function SignalLifecycle({ signal, onStatusChange }: SignalLifecycleProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="font-semibold">Status:</span>
      {statuses.map(s => (
        <button
          key={s}
          onClick={() => onStatusChange(s)}
          className={`px-2 py-1 rounded ${signal.status === s ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
