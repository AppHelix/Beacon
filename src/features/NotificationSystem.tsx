// src/features/NotificationSystem.tsx
"use client";
import React, { useState } from 'react';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const addNotification = (msg: string) => {
    setNotifications([msg, ...notifications]);
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Notifications</h2>
      <button onClick={() => addNotification("New Signal response received!")} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">Simulate Notification</button>
      <ul>
        {notifications.map((n, i) => (
          <li key={i} className="mb-2 bg-gray-100 p-2 rounded">{n}</li>
        ))}
      </ul>
    </div>
  );
}
