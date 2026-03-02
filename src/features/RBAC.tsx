// src/features/RBAC.tsx
"use client";
import React, { useState } from 'react';

const roles = ["Admin", "Curator", "Member", "Viewer"];

export default function RBAC() {
  const [role, setRole] = useState("Viewer");

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Role-Based Access Control</h2>
      <select value={role} onChange={e => setRole(e.target.value)} className="p-2 border rounded mb-4">
        {roles.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <div className="mb-2">Current Role: <span className="font-semibold">{role}</span></div>
      <div className="text-xs text-gray-600">(Simulated RBAC for demo)</div>
    </div>
  );
}
