// src/features/NotificationProvider.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: "success" | "error" | "info") => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = (message: string, type?: "success" | "error" | "info") => {
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), message, type },
      ...prev,
    ]);
  };
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
