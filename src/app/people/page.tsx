"use client";
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

function ClientPeopleDirectory() {
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "Curator":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "Member":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    }
  };

  return (
    <SidebarLayout
      title="People Directory"
      description="Connect and collaborate with team members"
    >
      {/* Filters */}
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchFilter}
                onChange={e => {
                  setSearchFilter(e.target.value);
                  updateQuery({ q: e.target.value || undefined });
                }}
                className="border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
              <select
                value={roleFilter}
                onChange={e => {
                  setRoleFilter(e.target.value);
                  updateQuery({ role: e.target.value || undefined });
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-slate-600">Loading people directory...</p>}

      {!isLoading && filteredUsers.length === 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No people found.</p>
          </CardContent>
        </Card>
      )}

      {/* People Cards */}
      {!isLoading && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map(user => (
            <Card key={user.id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="break-words text-lg font-semibold text-slate-900">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="break-all text-sm">
                      {user.email}
                    </CardDescription>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  <Link href={`/people?q=${encodeURIComponent(user.name)}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SidebarLayout>
  );
}

export default function PeopleDirectory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPeopleDirectory />
    </Suspense>
  );
}

export default function PeopleDirectory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPeopleDirectory />
    </Suspense>
  );
}
