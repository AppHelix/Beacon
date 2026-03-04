"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

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
          <button
            onClick={() => signIn("azure-ad")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">System settings and administration controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Management Card */}
        <div className="bg-white rounded shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">User Management</h3>
          <p className="text-gray-600 mb-4">Manage user accounts and roles</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">• Add/remove users</p>
            <p className="text-sm text-gray-600">• Assign roles (Admin, Curator, Member, Viewer)</p>
            <p className="text-sm text-gray-600">• Manage permissions</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Manage Users
          </button>
        </div>

        {/* System Settings Card */}
        <div className="bg-white rounded shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">System Settings</h3>
          <p className="text-gray-600 mb-4">Configure system-wide settings</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">• Email notifications</p>
            <p className="text-sm text-gray-600">• Azure AD integration</p>
            <p className="text-sm text-gray-600">• Database settings</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Settings
          </button>
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Analytics</h3>
          <p className="text-gray-600 mb-4">View system analytics and activity logs</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">• User activity metrics</p>
            <p className="text-sm text-gray-600">• Engagement statistics</p>
            <p className="text-sm text-gray-600">• System performance</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            View Analytics
          </button>
        </div>

        {/* Audit Logs Card */}
        <div className="bg-white rounded shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Audit Logs</h3>
          <p className="text-gray-600 mb-4">Track system activities and changes</p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">• User actions</p>
            <p className="text-sm text-gray-600">• Data changes</p>
            <p className="text-sm text-gray-600">• Security events</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            View Audit Logs
          </button>
        </div>
      </div>

      {/* Admin Info */}
      <div className="mt-8 bg-white rounded shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Environment</p>
            <p className="font-semibold text-gray-800">Production</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Database</p>
            <p className="font-semibold text-gray-800">PostgreSQL</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Authentication</p>
            <p className="font-semibold text-gray-800">Azure AD + NextAuth</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
