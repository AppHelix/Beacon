export const dynamic = "force-dynamic";
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return mock data for demo
    return [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Curator" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Member" },
      { id: 3, name: "Carol Williams", email: "carol@example.com", role: "Admin" },
    ];
  }
};

export default function PeopleDirectory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname ?? "/people";
  const getParam = (key: string) => searchParams?.get(key) ?? "";
  const [users, setUsers] = useState<User[]>([]);
  const [searchFilter, setSearchFilter] = useState(getParam("q"));
  const [roleFilter, setRoleFilter] = useState(getParam("role"));
  const [isLoading, setIsLoading] = useState(true);

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const query = params.toString();
    router.replace(query ? `${currentPath}?${query}` : currentPath, { scroll: false });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSearchFilter(searchParams?.get("q") ?? "");
    setRoleFilter(searchParams?.get("role") ?? "");
  }, [searchParams]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        !searchFilter ||
        user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchFilter, roleFilter]);

  const roles = Array.from(new Set(users.map(u => u.role)));

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
          <h1 className="text-4xl font-bold text-white mb-4">People Directory</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view the directory.</p>
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-700";
      case "Curator":
        return "bg-purple-100 text-purple-700";
      case "Member":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">People Directory</h1>
        <p className="text-gray-600">Connect and collaborate with team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchFilter}
          onChange={e => {
            setSearchFilter(e.target.value);
            updateQuery({ q: e.target.value || undefined });
          }}
          className="p-2 border rounded-none"
        />
        <select
          value={roleFilter}
          onChange={e => {
            setRoleFilter(e.target.value);
            updateQuery({ role: e.target.value || undefined });
          }}
          className="p-2 border rounded-none"
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-600">Loading people directory...</p>}

      {!isLoading && filteredUsers.length === 0 && (
        <p className="text-gray-600">No people found.</p>
      )}

      {!isLoading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-none shadow-md p-6 hover:shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className={`text-xs px-3 py-1 rounded-none font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <Link href={`/people?q=${encodeURIComponent(user.name)}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none inline-block text-center">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
