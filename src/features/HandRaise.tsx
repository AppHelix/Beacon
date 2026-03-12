"use client";
// src/features/HandRaise.tsx
import React from 'react';
import { FaHandPaper } from 'react-icons/fa';

interface HandRaiseProps {
  raised: boolean;
  loading?: boolean;
  onRaise: () => void;
}

export default function HandRaise({ raised, loading, onRaise }: HandRaiseProps) {
  return (
    <div className="relative group">
      <button
        onClick={onRaise}
        disabled={raised || loading}
        className={`flex items-center gap-4 px-8 py-3 rounded-full text-lg font-bold border-4 border-yellow-500 shadow-2xl bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-200
          ${raised
            ? 'bg-yellow-200 text-yellow-900 border-yellow-400'
            : 'hover:bg-yellow-400 hover:text-white hover:scale-105'}
          ${loading ? 'opacity-60 cursor-wait' : ''}`}
        aria-pressed={raised}
        aria-label={raised ? 'Hand Raised' : 'Raise Hand'}
        tabIndex={0}
        style={{ minWidth: 200, letterSpacing: 1 }}
      >
        <span className="flex items-center justify-center bg-yellow-100 rounded-full p-2 mr-3 animate-bounce group-hover:animate-none">
          <FaHandPaper className={`text-3xl drop-shadow ${raised ? 'text-yellow-700' : 'text-yellow-500'}`} />
        </span>
        <span className="whitespace-nowrap drop-shadow-lg">
          {raised ? "Hand Raised" : loading ? "Raising..." : "Raise Hand"}
        </span>
      </button>
      {/* Tooltip removed to avoid duplicate message in UI */}
    </div>
  );
}
