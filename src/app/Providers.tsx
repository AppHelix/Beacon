"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/features/NotificationProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
