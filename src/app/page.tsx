"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">🚀 Beacon</h1>
          <p className="text-gray-300 text-xl mb-8">Collaboration Engine</p>
          <p className="text-gray-400 mb-8 max-w-md">
            Sign in with your Azure AD account to access engagements, signals, team collaboration, and more.
          </p>
          <button
            onClick={() => signIn("azure-ad")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
          >
            Sign In with Azure AD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-slate-950 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🚀 Beacon</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Engagements Card */}
          <Link href="/engagements">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Engagements</h2>
              <p className="text-gray-600 mb-4">
                Manage and track all active engagements
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
                View Catalog
              </button>
            </div>
          </Link>

          {/* Signals Card */}
          <Link href="/signals">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">🔔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Signals</h2>
              <p className="text-gray-600 mb-4">
                Create and collaborate on project signals
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
                View Board
              </button>
            </div>
          </Link>

          {/* People Directory Card */}
          <Link href="/people">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">People</h2>
              <p className="text-gray-600 mb-4">
                Explore team members and their expertise
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">
                Directory
              </button>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin</h2>
              <p className="text-gray-600 mb-4">
                Manage system settings and users
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full">
                Settings
              </button>
            </div>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Beacon</h2>
          <p className="text-gray-600 mb-4">
            Beacon is a collaborative platform for managing engagements, tracking signals, and building high-performing teams.
          </p>
          <p className="text-gray-600">
            Use the navigation above to explore engagements, create signals, connect with team members, and configure system settings.
          </p>
        </div>
      </div>
    </div>
  );
}
