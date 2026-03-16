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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Typeahead } from "@/components/Typeahead";
import { FacetedFilters, Facet } from "@/components/FacetedFilters";
import { searchInFields, getTypeaheadSuggestions, expandWithSynonyms, extractFacetOptions, applyFacetFilters } from "@/lib/search-utils";

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

function EngagementCatalogContent() {
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
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({});
  const [showFacets, setShowFacets] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    status: "Open",
    description: "",
    techTags: ""
  });

  const userRole = session?.user?.role?.toLowerCase();
  const canCreateEngagement = userRole === 'admin' || userRole === 'curator';

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
    let filtered = engagements.filter(e => {
      // Use synonym-aware search across multiple fields
      const matchesSearch = !filter || searchInFields(
        [
          e.name,
          e.clientName,
          e.description,
          e.techTags
        ],
        filter
      );
      const matchesStatus = !statusFilter || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Apply facet filters
    filtered = applyFacetFilters(filtered, facetFilters, (item, field) => {
      switch (field) {
        case 'status':
          return item.status;
        case 'client':
          return item.clientName;
        case 'tech':
          if (!item.techTags) return [];
          // techTags is stored as comma-separated string
          return item.techTags.split(',').map(tag => tag.trim()).filter(Boolean);
        default:
          return null;
      }
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
  }, [engagements, filter, sort, statusFilter, facetFilters]);

  // Build facets from all engagements (before filtering)
  const facets: Facet[] = useMemo(() => [
    {
      id: 'status',
      label: 'Status',
      options: extractFacetOptions(engagements, (e) => e.status).map(opt => ({
        ...opt,
        label: opt.value.charAt(0).toUpperCase() + opt.value.slice(1)
      })),
      multiSelect: true,
    },
    {
      id: 'client',
      label: 'Client',
      options: extractFacetOptions(engagements, (e) => e.clientName).map(opt => ({
        ...opt,
        label: opt.value
      })),
      multiSelect: true,
    },
    {
      id: 'tech',
      label: 'Technology',
      options: extractFacetOptions(engagements, (e) => {
        if (!e.techTags) return [];
        // techTags is stored as comma-separated string, not JSON
        return e.techTags.split(',').map(tag => tag.trim()).filter(Boolean);
      }).map(opt => ({
        ...opt,
        label: opt.value.charAt(0).toUpperCase() + opt.value.slice(1)
      })),
      multiSelect: true,
    },
  ], [engagements]);

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

  return (
    <SidebarLayout
      title="Engagements"
      description="Discover and explore active projects and opportunities"
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Create Engagement Button */}
      {canCreateEngagement && (
        <div className="mb-6 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                + Create Engagement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Engagement</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setError("");
                  try {
                    const res = await fetch("/api/engagements", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form)
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      setError(data.error || "Failed to create engagement");
                    } else {
                      setOpen(false);
                      setForm({
                        name: "",
                        clientName: "",
                        status: "Open",
                        description: "",
                        techTags: ""
                      });
                      // Refresh engagements list
                      const updated = await fetchEngagements();
                      setEngagements(updated);
                    }
                  } catch {
                    setError("Failed to create engagement");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Engagement Name *</label>
                  <Input
                    required
                    placeholder="e.g., Customer Portal Modernization"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name *</label>
                  <Input
                    required
                    placeholder="e.g., Acme Corporation"
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status *</label>
                  <select
                    required
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="Scoping">Scoping</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Brief description of the engagement..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Tags</label>
                  <Input
                    placeholder="e.g., React,TypeScript,Node.js,PostgreSQL"
                    value={form.techTags}
                    onChange={e => setForm(f => ({ ...f, techTags: e.target.value }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
                </div>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    {submitting ? "Creating..." : "Create Engagement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8 border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">
                Search <span className="text-xs font-normal text-slate-500">(with synonyms)</span>
              </label>
              <Typeahead
                value={filter}
                onChange={(value) => {
                  setFilter(value);
                  updateQuery({ q: value || undefined, page: "1" });
                }}
                getSuggestions={(query) => {
                  // Generate suggestions from engagement names, clients, and tech tags
                  const allValues = [
                    ...engagements.map(e => e.name),
                    ...engagements.map(e => e.clientName),
                    ...engagements.flatMap(e => {
                      if (!e.techTags) return [];
                      // techTags is stored as comma-separated string
                      return e.techTags.split(',').map(tag => tag.trim()).filter(Boolean);
                    })
                  ];
                  const unique = Array.from(new Set(allValues));
                  const suggestions = getTypeaheadSuggestions(
                    unique.map(v => ({ value: v })),
                    query,
                    (item) => item.value,
                    8
                  );
                  const expanded = expandWithSynonyms(query);
                  return suggestions.map(s => ({
                    value: s.value,
                    label: s.value,
                    meta: expanded.length > 1 && expanded.some(t => s.value.toLowerCase().includes(t)) 
                      ? 'synonym' 
                      : ''
                  }));
                }}
                placeholder="Search name, client, or technology..."
                minChars={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  updateQuery({ status: e.target.value || undefined, page: "1" });
                }}
                className="w-full rounded-lg border border-slate-300 p-3 text-base h-11 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-3 block text-base font-semibold text-slate-700 dark:text-slate-300">Sort By</label>
              <select
                value={sort}
                onChange={e => {
                  setSort(e.target.value);
                  updateQuery({ sort: e.target.value, page: "1" });
                }}
                className="w-full rounded-lg border border-slate-300 p-3 text-base h-11 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              >
                <option value="updated-desc">Newest Updated</option>
                <option value="updated-asc">Oldest Updated</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFacets(!showFacets)}
          className="gap-2"
        >
          {showFacets ? '− Hide Advanced Filters' : '+ Show Advanced Filters'}
        </Button>
        {Object.values(facetFilters).flat().length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {Object.values(facetFilters).flat().length} active
          </Badge>
        )}
      </div>

      {/* Faceted Filters */}
      {showFacets && (
        <div className="mb-8">
          <FacetedFilters
            facets={facets}
            selectedFilters={facetFilters}
            onChange={(facetId, values) => {
              setFacetFilters(prev => ({
                ...prev,
                [facetId]: values
              }));
            }}
            onClear={() => setFacetFilters({})}
          />
        </div>
      )}

      {isLoading && <p className="text-lg text-slate-600 dark:text-slate-400 py-8 text-center">Loading engagement data...</p>}

      {!isLoading && filteredEngagements.length === 0 && !error && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400">No engagements found.</p>
          </CardContent>
        </Card>
      )}

      {/* Engagement Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedEngagements.map(e => (
          <Card key={e.id} className="group overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-lg hover:border-indigo-200">
            <CardHeader className="pb-4 bg-white dark:bg-slate-900 rounded-t-xl">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="break-words text-xl font-bold !text-slate-900 dark:!text-white leading-tight">
                  {e.name}
                </CardTitle>
                <Badge
                  className={
                    e.status === 'Active'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : e.status === 'Paused'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                  }
                >
                  {e.status}
                </Badge>
              </div>
              <CardDescription className="text-base mt-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Client:</span> 
                <span className="font-semibold text-slate-800 dark:text-white ml-1">{e.clientName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {e.description && (
                <p className="mb-4 break-words text-base text-slate-600 dark:text-slate-400 leading-relaxed">{e.description}</p>
              )}
              {e.techTags && (
                <p className="mb-6 break-words text-sm text-slate-500 dark:text-slate-500">
                  <span className="font-semibold">Tags:</span> 
                  <span className="ml-1">{e.techTags}</span>
                </p>
              )}
              <Button asChild className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-base font-semibold py-2.5 h-12">
                <Link href={`/engagements/${e.id}?tab=overview`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && filteredEngagements.length > 0 && (
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
            Page {safePage} of {totalPages} ({filteredEngagements.length} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => updateQuery({ page: safePage > 1 ? String(safePage - 1) : "1" })}
              disabled={safePage <= 1}
              className="rounded-lg text-base font-semibold px-6 py-2.5 h-12"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => updateQuery({ page: safePage < totalPages ? String(safePage + 1) : String(totalPages) })}
              disabled={safePage >= totalPages}
              className="rounded-lg text-base font-semibold px-6 py-2.5 h-12"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

export default function EngagementCatalog() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      )}
    >
      <EngagementCatalogContent />
    </Suspense>
  );
}