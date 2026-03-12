// src/features/NotificationToaster.tsx
"use client";
import React from "react";
import { useNotification } from "./NotificationProvider";

export default function NotificationToaster() {
  const { notifications, removeNotification } = useNotification();
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-6 py-3 rounded-lg shadow-lg font-semibold text-base flex items-center gap-2 transition-all animate-fade-in-down
            ${n.type === "error" ? "bg-red-600 text-white" : n.type === "success" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}
          role="alert"
          onClick={() => removeNotification(n.id)}
          style={{ cursor: "pointer", minWidth: 220 }}
        >
          {n.type === "error" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : n.type === "success" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
          )}
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  );
}
