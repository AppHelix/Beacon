"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, BarChart3, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to access admin settings.</p>
          <Button
            onClick={() => signIn("azure-ad")}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has admin or curator role
  const userRole = session.user?.role?.toLowerCase();
  const hasAdminAccess = userRole === "admin" || userRole === "curator";

  if (!hasAdminAccess) {
    return (
      <SidebarLayout title="Access Denied">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 font-semibold mb-2">Access Denied</p>
            <p className="text-slate-600">You do not have permission to access the admin dashboard.</p>
            <p className="text-sm text-slate-500 mt-2">Only users with Admin or Curator roles can access this page.</p>
          </CardContent>
        </Card>
      </SidebarLayout>
    );
  }

  const adminCards = [
    {
      icon: Users,
      title: "User Management",
      description: "Manage user accounts and roles",
      features: [
        "Add/remove users",
        "Assign roles (Admin, Curator, Member, Viewer)",
        "Manage permissions"
      ],
      action: "Manage Users"
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure system-wide settings",
      features: [
        "Email notifications",
        "Azure AD integration",
        "Database settings"
      ],
      action: "Settings"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View system analytics and activity logs",
      features: [
        "User activity metrics",
        "Engagement statistics",
        "System performance"
      ],
      action: "View Analytics"
    },
    {
      icon: FileText,
      title: "Audit Logs",
      description: "Track system activities and changes",
      features: [
        "User actions",
        "Data changes",
        "Security events"
      ],
      action: "View Audit Logs"
    }
  ];

  return (
    <SidebarLayout
      title="Admin Dashboard"
      description="System settings and administration controls"
    >
      {/* Admin Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {adminCards.map((card, index) => (
          <Card key={index} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <card.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-slate-900">{card.title}</CardTitle>
                  <CardDescription className="mt-1">{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                {card.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700">
                {card.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      <Card className="mt-8 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">System Information</CardTitle>
          <CardDescription>Current system configuration and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Environment</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Production</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Database</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">PostgreSQL</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Authentication</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Azure AD + NextAuth</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Last Updated</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
