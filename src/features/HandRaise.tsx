"use client";
// src/features/HandRaise.tsx
import React, { useState } from 'react';

export default function HandRaise({ onRaise }: { onRaise: () => void }) {
  const [raised, setRaised] = useState(false);

  const handleRaise = () => {
    setRaised(true);
    onRaise();
  };

  return (
    <button
      onClick={handleRaise}
      disabled={raised}
      className={`px-4 py-2 rounded ${raised ? 'bg-gray-400' : 'bg-green-500 text-white'}`}
    >
      {raised ? "Hand Raised" : "Raise Hand"}
    </button>
  );
}
