"use client";
export const dynamic = "force-dynamic";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Signal {
  id: number;
  title: string;
  description: string;
  engagementId: number;
  createdBy: string;
  status: string;
  urgency: string;
  requiredSkills?: string;
  createdAt: string;
  updatedAt: string;
}

const normalize = (value: string) => value.trim().toLowerCase();
const urgencyOrder = ["low", "medium", "high"] as const;

const fetchSignals = async (): Promise<Signal[]> => {
  try {
    const res = await fetch("/api/signals");
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching signals:", error);
    return [];
  }
};

function SignalBoardContent() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", engagementId: "", urgency: "medium", requiredSkills: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname ?? "/signals";
  const getParam = (key: string) => searchParams?.get(key) ?? "";
  const [signals, setSignals] = useState<Signal[]>([]);
  const [statusFilter, setStatusFilter] = useState(getParam("status"));
  const [urgencyFilter, setUrgencyFilter] = useState(getParam("urgency"));
  const [search, setSearch] = useState(getParam("q"));
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
    fetchSignals()
      .then(setSignals)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setStatusFilter(searchParams?.get("status") ?? "");
    setUrgencyFilter(searchParams?.get("urgency") ?? "");
    setSearch(searchParams?.get("q") ?? "");
  }, [searchParams]);

  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      const matchesStatus = !statusFilter || signal.status === statusFilter;
      const matchesUrgency = !urgencyFilter || normalize(signal.urgency) === normalize(urgencyFilter);
      const matchesSearch =
        !search ||
        signal.title.toLowerCase().includes(search.toLowerCase()) ||
        signal.description.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesUrgency && matchesSearch;
    });
  }, [signals, statusFilter, urgencyFilter, search]);

  const statusOptions = Array.from(new Set(signals.map(s => s.status)));
  const urgencyOptions = urgencyOrder;

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
          <h1 className="text-4xl font-bold text-white mb-4">Signal Board</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view signals.</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "in-progress":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "closed":
        return "bg-slate-100 text-slate-700 hover:bg-slate-100";
      default:
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (normalize(urgency)) {
      case "high":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      default:
        return "bg-green-100 text-green-700 hover:bg-green-100";
    }
  };

  return (
    <SidebarLayout
      title="Signals"
      description="Track and collaborate on project signals and issues"
    >
      {/* Create Signal Modal */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="mb-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Signal</Button>
        </SheetTrigger>
        <SheetContent side="right" className="max-w-md">
          <SheetHeader>
            <SheetTitle>Create Signal</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setSubmitting(true);
              setError("");
              try {
                const res = await fetch("/api/signals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...form, engagementId: Number(form.engagementId), createdBy: session?.user?.name || "" })
                });
                if (!res.ok) {
                  const data = await res.json();
                  setError(data.error || "Failed to create signal");
                } else {
                  setOpen(false);
                  setForm({ title: "", description: "", engagementId: "", urgency: "medium", requiredSkills: "" });
                  fetchSignals().then(setSignals);
                }
              } catch (err) {
                setError("Failed to create signal");
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-4 mt-4"
          >
            <Input
              required
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Input
              required
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Input
              required
              placeholder="Engagement ID"
              value={form.engagementId}
              onChange={e => setForm(f => ({ ...f, engagementId: e.target.value }))}
              type="number"
            />
            <select
              value={form.urgency}
              onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Input
              placeholder="Required Skills (comma separated)"
              value={form.requiredSkills}
              onChange={e => setForm(f => ({ ...f, requiredSkills: e.target.value }))}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <SheetFooter>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create</Button>
              <SheetClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
              <Input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  updateQuery({ q: e.target.value || undefined });
                }}
                placeholder="Search title or description..."
                className="border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  updateQuery({ status: e.target.value || undefined });
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Urgency</label>
              <select
                value={urgencyFilter}
                onChange={e => {
                  setUrgencyFilter(e.target.value);
                  updateQuery({ urgency: e.target.value || undefined });
                }}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              >
                <option value="">All Urgency</option>
                {urgencyOptions.map(urgency => (
                  <option key={urgency} value={urgency}>
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-slate-600">Loading signals...</p>}

          {!isLoading && filteredSignals.length === 0 && (
            <p className="p-6 text-center text-slate-600">No signals found.</p>
          )}

          {!isLoading && filteredSignals.length > 0 && (
            <div className="divide-y divide-slate-200">
              {filteredSignals.map(signal => (
                <div key={signal.id} className="p-4 transition-colors hover:bg-slate-50">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <a href={`/signals/${signal.id}`} className="break-words text-lg font-semibold text-indigo-700 hover:underline">
                      {signal.title}
                    </a>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status.toUpperCase()}
                      </Badge>
                      <Badge className={getUrgencyColor(signal.urgency)}>
                        {signal.urgency}
                      </Badge>
                      <select
                        value={signal.status}
                        onChange={async e => {
                          // Normalize status value to lowercase and hyphenated
                          const newStatus = e.target.value.toLowerCase().replace(/ /g, "-");
                          await fetch("/api/signals", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: Number(signal.id), status: newStatus })
                          });
                          fetchSignals().then(setSignals);
                        }}
                        className="ml-2 rounded border border-slate-300 p-1 text-xs"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <p className="mb-3 break-words text-sm text-slate-600">{signal.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium">Created by: {signal.createdBy}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Engagement ID: {signal.engagementId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}

export default function SignalBoard() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      )}
    >
      <SignalBoardContent />
    </Suspense>
  );
}
