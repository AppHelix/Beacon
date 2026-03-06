"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Engagement {
  id: number;
  name: string;
  clientName: string;
  status: string;
  description?: string;
  techTags?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchEngagements = async (): Promise<Engagement[]> => {
  try {
    const res = await fetch("/api/engagements", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized - please log in");
      }
      throw new Error("Failed to fetch engagements");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return [];
  }
};

export default function EngagementCatalog() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname ?? "/engagements";
  const getParam = (key: string) => searchParams?.get(key) ?? "";
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [filter, setFilter] = useState(getParam("q"));
  const [statusFilter, setStatusFilter] = useState(getParam("status"));
  const [sort, setSort] = useState(getParam("sort") || "updated-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const pageParam = Number(getParam("page") || "1");
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 9;

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
    fetchEngagements()
      .then(setEngagements)
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setFilter(searchParams?.get("q") ?? "");
    setStatusFilter(searchParams?.get("status") ?? "");
    setSort(searchParams?.get("sort") ?? "updated-desc");
  }, [searchParams]);

  const filteredEngagements = useMemo(() => {
    const filtered = engagements.filter(e => {
      const matchesSearch =
        !filter ||
        e.name.toLowerCase().includes(filter.toLowerCase()) ||
        e.clientName.toLowerCase().includes(filter.toLowerCase());
      const matchesStatus = !statusFilter || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "updated-asc":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "updated-desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return sorted;
  }, [engagements, filter, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEngagements.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEngagements = filteredEngagements.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (currentPage !== safePage) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("page", String(safePage));
      const query = params.toString();
      router.replace(query ? `${currentPath}?${query}` : currentPath, { scroll: false });
    }
  }, [currentPage, currentPath, router, safePage, searchParams]);

  const statuses = Array.from(new Set(engagements.map(e => e.status)));

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
          <h1 className="text-4xl font-bold text-white mb-4">Engagement Catalog</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view engagements.</p>
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
    <div className="p-4 md:p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6">Engagement Catalog</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-none">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by name or client..."
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            updateQuery({ q: e.target.value || undefined, page: "1" });
          }}
          className="p-2 border rounded-none"
        />
        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            updateQuery({ status: e.target.value || undefined, page: "1" });
          }}
          className="p-2 border rounded-none"
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => {
            setSort(e.target.value);
            updateQuery({ sort: e.target.value, page: "1" });
          }}
          className="p-2 border rounded-none"
        >
          <option value="updated-desc">Newest Updated</option>
          <option value="updated-asc">Oldest Updated</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-600">Loading engagement data...</p>}

      {!isLoading && filteredEngagements.length === 0 && !error && (
        <p className="text-gray-600">No engagements found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedEngagements.map(e => (
          <div key={e.id} className="p-4 border rounded-none shadow hover:shadow-lg bg-white">
            <h2 className="font-bold text-lg mb-1">{e.name}</h2>
            <p className="text-sm text-gray-600 mb-2">Client: {e.clientName}</p>
            <p className="text-sm mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                e.status === 'Active' ? 'bg-green-100 text-green-700' :
                e.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {e.status}
              </span>
            </p>
            {e.description && <p className="text-xs text-gray-500 mb-2">{e.description}</p>}
            {e.techTags && (
              <p className="text-xs text-gray-500">
                Tags: {e.techTags}
              </p>
            )}
            <Link
              href={`/engagements/${e.id}?tab=overview`}
              className="mt-4 block text-center bg-blue-600 text-white p-2 rounded-none hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {!isLoading && filteredEngagements.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded-none disabled:opacity-50"
              onClick={() => updateQuery({ page: safePage > 1 ? String(safePage - 1) : "1" })}
              disabled={safePage <= 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded-none disabled:opacity-50"
              onClick={() => updateQuery({ page: safePage < totalPages ? String(safePage + 1) : String(totalPages) })}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}