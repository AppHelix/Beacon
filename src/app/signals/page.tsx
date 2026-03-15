
"use client";

import React, { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useNotification } from "@/features/NotificationProvider";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSession, signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import KanbanBoard from "./KanbanBoard";
import HandRaise from "@/features/HandRaise";

export const dynamic = "force-dynamic";

// Simple toast system

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

interface Signal {
  id: number;
  title: string;
  description: string;
  engagementId: number;
  createdBy: string;
  status: string;
  urgency: string;
  requiredSkills?: string;
  resolutionSummary?: string;
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
    const { addNotification } = useNotification();
  // ...existing code...
  // Suggestion form refs per signal
  const suggestionFormRefs = useRef<Record<number, HTMLFormElement | null>>({});
  const { data: session, status } = useSession();
  
  // Get user role for RBAC
  const userRole = session?.user?.role?.toLowerCase();
  const canCreateSignal = userRole === 'admin' || userRole === 'curator' || userRole === 'member';
  
  // Debug: Log role and permission
  console.log('[Signals] User role:', userRole, 'Can create signal:', canCreateSignal);
  
  const [kanban, setKanban] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'urgency' | 'title'>("createdAt");
  const [open, setOpen] = useState(false);
  const [engagements, setEngagements] = useState<{ id: number; name: string }[]>([]);
  const [handRaises, setHandRaises] = useState<Record<number, { userEmail: string; userName: string }[]>>({});
  const [handRaiseLoading, setHandRaiseLoading] = useState<Record<number, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<number, { userName: string; suggestionText: string; createdAt: string }[]>>({});
  const [detailOpen, setDetailOpen] = useState<number|null>(null);
  // Resolution summary dialog state
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [pendingSignalId, setPendingSignalId] = useState<number|null>(null);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [summarySubmitting, setSummarySubmitting] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  // DEBUG: Log session and handRaises
  useEffect(() => {
    console.log('Session:', session);
    console.log('HandRaises:', handRaises);
  }, [session, handRaises]);
  // Fetch engagements for select input
  useEffect(() => {
      if (open) {
        fetch("/api/engagements")
          .then(res => res.ok ? res.json() : [])
            .then(data => setEngagements(data.map((e: { id: number; name: string }) => ({ id: e.id, name: e.name }))))
          .catch(() => setEngagements([]));
      }
    }, [open]);
  const [form, setForm] = useState<{ title: string; description: string; engagementId: string; urgency: string; requiredSkills: string }>({ title: "", description: "", engagementId: "", urgency: "medium", requiredSkills: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname ?? "/signals";
  const getParam = (key: string) => searchParams?.get(key) ?? "";
  const [signals, setSignals] = useState<Signal[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(getParam("status"));
  const [urgencyFilter, setUrgencyFilter] = useState<string>(getParam("urgency"));
  const [search, setSearch] = useState<string>(getParam("q"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      .then(async signals => {
        setSignals(signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        // Fetch hand-raises for each signal
        const handRaiseMap: Record<number, { userEmail: string; userName: string }[]> = {};
          await Promise.all(signals.map(async (signal: Signal) => {
          const res = await fetch(`/api/signals/${signal.id}/hand-raise`);
          if (res.ok) {
            handRaiseMap[signal.id] = await res.json();
          } else {
            handRaiseMap[signal.id] = [];
          }
        }));
        setHandRaises(handRaiseMap);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setStatusFilter(searchParams?.get("status") ?? "");
    setUrgencyFilter(searchParams?.get("urgency") ?? "");
    setSearch(searchParams?.get("q") ?? "");
  }, [searchParams]);

  const filteredSignals = useMemo<Signal[]>(() => {
    let arr = signals.filter(signal => {
      const matchesStatus = !statusFilter || signal.status === statusFilter;
      const matchesUrgency = !urgencyFilter || normalize(signal.urgency) === normalize(urgencyFilter);
      const matchesSearch =
        !search ||
        signal.title.toLowerCase().includes(search.toLowerCase()) ||
        signal.description.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesUrgency && matchesSearch;
    });
    if (sortBy === "createdAt") {
      arr = arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "urgency") {
      const urgencyRank = { low: 0, medium: 1, high: 2 };
      arr = arr.sort((a, b) =>
        (urgencyRank[normalize(b.urgency) as keyof typeof urgencyRank] ?? 0) -
        (urgencyRank[normalize(a.urgency) as keyof typeof urgencyRank] ?? 0)
      );
    } else if (sortBy === "title") {
      arr = arr.sort((a, b) =>
        a.title.trim().toLocaleLowerCase().localeCompare(b.title.trim().toLocaleLowerCase())
      );
    }
    return arr;
  }, [signals, statusFilter, urgencyFilter, search, sortBy]);
  // Enhanced status change handler to support resolution summary
  const handleStatusChange = async (id: number, newStatus: string, _signal?: Signal) => {
    if (newStatus === "resolved") {
      setPendingSignalId(id);
      setShowSummaryDialog(true);
      setResolutionSummary("");
      setSummaryError("");
      return;
    }
    await fetch("/api/signals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchSignals().then(signals => setSignals(signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
  };

  // Handler for submitting resolution summary
  const handleSubmitSummary = async () => {
    if (!pendingSignalId) return;
    if (!resolutionSummary.trim()) {
      setSummaryError("Resolution summary is required.");
      return;
    }
    setSummarySubmitting(true);
    setSummaryError("");
    try {
      await fetch("/api/signals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingSignalId, status: "resolved", resolutionSummary })
      });
      setShowSummaryDialog(false);
      setPendingSignalId(null);
      setResolutionSummary("");
      fetchSignals().then(signals => setSignals(signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
      addNotification("Signal marked as resolved.", "success");
    } catch {
      setSummaryError("Failed to submit summary.");
    } finally {
      setSummarySubmitting(false);
    }
  };

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
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Button variant={kanban ? "outline" : "default"} onClick={() => setKanban(false)}>List View</Button>
          <Button variant={kanban ? "default" : "outline"} onClick={() => setKanban(true)}>Kanban View</Button>
          <label className="text-sm">Sort by:
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'createdAt' | 'urgency' | 'title')} className="ml-2 border rounded p-1">
              <option value="createdAt">Created At</option>
              <option value="urgency">Urgency</option>
              <option value="title">Title</option>
            </select>
          </label>
          <div className="ml-auto">
            {canCreateSignal && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Signal</Button>
                </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Signal</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setSubmitting(true);
                    setError("");
                    try {
                      const res = await fetch("/api/signals", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...form, engagementId: form.engagementId, createdBy: session?.user?.name || "" })
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        setError(data.error || "Failed to create signal");
                      } else {
                        setOpen(false);
                        setForm({ title: "", description: "", engagementId: "", urgency: "medium", requiredSkills: "" });
                        fetchSignals().then(signals => setSignals(signals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
                      }
                    } catch {
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
                  <select
                    required
                    value={form.engagementId}
                    onChange={e => setForm(f => ({ ...f, engagementId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    <option value="">Select Engagement</option>
                    {engagements.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
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
                  <DialogFooter>
                    <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create</Button>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        {/* Filter/Search Card */}
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

        {/* Signals List or Kanban */}
        {kanban ? (
          <KanbanBoard signals={filteredSignals} onStatusChange={handleStatusChange} />
        ) : (
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
                        <button
                          className="break-words text-lg font-semibold text-indigo-700 hover:underline text-left"
                          onClick={() => setDetailOpen(signal.id)}
                        >
                          {signal.title}
                        </button>
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
                              const newStatus = e.target.value.toLowerCase().replace(/ /g, "-");
                              await handleStatusChange(signal.id, newStatus, signal);
                            }}
                            className="ml-2 rounded border border-slate-300 p-1 text-xs"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          {/* HandRaise button */}
                          <div className="flex items-center">
                            <HandRaise
                              raised={!!handRaises[signal.id]?.some(u => u.userEmail === session?.user?.email)}
                              loading={!!handRaiseLoading[signal.id]}
                              onRaise={async () => {
                                setHandRaiseLoading(l => ({ ...l, [signal.id]: true }));
                                const res = await fetch(`/api/signals/${signal.id}/hand-raise`, { method: 'POST' });
                                if (res.ok) {
                                  let newRaise = null;
                                  if (res.headers.get("content-type")?.includes("application/json")) {
                                    newRaise = await res.json();
                                  }
                                  setHandRaises(prev => ({
                                    ...prev,
                                    [signal.id]: [...(prev[signal.id] || []), newRaise].filter(Boolean)
                                  }));
                                  addNotification('Hand raised!', 'success');
                                } else {
                                  let err = { error: 'Failed to raise hand' };
                                  if (res.headers.get("content-type")?.includes("application/json")) {
                                    err = await res.json();
                                  }
                                  addNotification(err.error || 'Failed to raise hand', 'error');
                                }
                                setHandRaiseLoading(l => ({ ...l, [signal.id]: false }));
                              }}
                            />
                          </div>
                          {/* Show count of hand-raises */}
                          {handRaises[signal.id]?.length > 0 && (
                            <span className="text-xs text-green-700 ml-2">{handRaises[signal.id].length} raised</span>
                          )}
                          {/* Prominent already raised message */}
                          {!!handRaises[signal.id]?.some(u => u.userEmail === session?.user?.email) && (
                            <div
                              className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-yellow-900 bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 shadow-lg dark:bg-gradient-to-r dark:from-yellow-800 dark:to-yellow-700 dark:text-yellow-50 dark:border-yellow-600"
                              style={{ maxWidth: 400 }}
                            >
                              <svg className="w-6 h-6 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 1110 0v4m-1 4v2a3 3 0 11-6 0v-2m-4 0h14" /></svg>
                              <span className="text-base">You&apos;ve already raised your hand for this signal</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mb-3 break-words text-sm text-slate-600">{signal.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium">Created by: {signal.createdBy}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Engagement ID: {signal.engagementId}</span>
                      </div>
                      {/* Suggestion responses preview */}
                      {suggestions[signal.id]?.length > 0 && (
                        <button
                          className="mt-2 text-xs text-blue-700 underline cursor-pointer bg-transparent border-0 p-0"
                          onClick={() => {
                            setDetailOpen(signal.id);
                            setTimeout(() => {
                              const el = document.getElementById(`suggestions-section-${signal.id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 300);
                          }}
                          tabIndex={0}
                        >
                          Suggestions: {suggestions[signal.id].length}
                        </button>
                      )}
                      {/* Detail modal for full view and suggestions */}
                      <Dialog
                        open={detailOpen === signal.id}
                        onOpenChange={async open => {
                          setDetailOpen(open ? signal.id : null);
                          if (open) {
                            // Fetch suggestions from backend
                            const res = await fetch(`/api/signals/${signal.id}/suggestion`);
                            if (res.ok) {
                              const data = await res.json();
                              setSuggestions(prev => ({ ...prev, [signal.id]: data }));
                            }
                          }
                        }}
                      >
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{signal.title}</DialogTitle>
                          </DialogHeader>
                          <div className="mb-2 text-gray-700">{signal.description}</div>
                          <div className="mb-2 text-xs">Skills: {signal.requiredSkills}</div>
                          <div className="mb-4 text-sm">Status: {signal.status}</div>
                          {signal.status === "resolved" && signal.resolutionSummary && (
                            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200">
                              <div className="font-semibold text-green-900 mb-1">Resolution Summary:</div>
                              <div className="text-green-800 whitespace-pre-line">{signal.resolutionSummary}</div>
                            </div>
                          )}
                          <div className="mb-2">
                            <strong>Hand Raises:</strong> {handRaises[signal.id]?.length > 0
                              ? handRaises[signal.id].map(u => u.userName).join(", ")
                              : "None"}
                          </div>
                          <HandRaise
                            raised={!!handRaises[signal.id]?.some(u => u.userName === session?.user?.email)}
                            loading={!!handRaiseLoading[signal.id]}
                            onRaise={async () => {
                              setHandRaiseLoading(l => ({ ...l, [signal.id]: true }));
                              const res = await fetch(`/api/signals/${signal.id}/hand-raise`, { method: 'POST' });
                              if (res.ok) {
                                const newRaise = await res.json();
                                setHandRaises(prev => ({
                                  ...prev,
                                  [signal.id]: [...(prev[signal.id] || []), newRaise]
                                }));
                                addNotification('Hand raised!', 'success');
                              } else {
                                const err = await res.json();
                                addNotification(err.error || 'Failed to raise hand', 'error');
                              }
                              setHandRaiseLoading(l => ({ ...l, [signal.id]: false }));
                            }}
                          />
                          <div className="mt-6" id={`suggestions-section-${signal.id}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m10-4v4m0 0l-4-4m4 4l4-4" /></svg>
                              <strong className="text-lg">Suggestions/Responses</strong>
                            </div>
                            <ul className="mb-4 max-h-40 overflow-y-auto pr-2">
                              {(suggestions[signal.id] || []).map((r, i) => (
                                <li key={i} className="flex items-start gap-2 bg-gray-50 p-2 mb-2 rounded border border-gray-100">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                                    {r.userName?.[0] || '?'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-sm text-blue-900">{r.userName}</div>
                                    <div className="text-gray-800 text-sm whitespace-pre-line">{r.suggestionText}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <form
                              ref={el => { suggestionFormRefs.current[signal.id] = el; }}
                              onSubmit={async e => {
                                e.preventDefault();
                                const formEl = suggestionFormRefs.current[signal.id];
                                if (!formEl) return;
                                const formData = new FormData(formEl);
                                const value = formData.get("suggestion")?.toString().trim();
                                if (value) {
                                  const res = await fetch(`/api/signals/${signal.id}/suggestion`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ suggestionText: value })
                                  });
                                  if (res.ok) {
                                    // Refresh suggestions from backend
                                    const listRes = await fetch(`/api/signals/${signal.id}/suggestion`);
                                    if (listRes.ok) {
                                      const data = await listRes.json();
                                      setSuggestions(prev => ({ ...prev, [signal.id]: data }));
                                    }
                                    formEl.reset();
                                  } else {
                                    addNotification('Failed to submit suggestion', 'error');
                                  }
                                }
                              }}
                              className="flex gap-2 items-end mt-2"
                            >
                              <textarea
                                name="suggestion"
                                rows={2}
                                placeholder="Add a suggestion..."
                                className="p-2 border rounded w-full resize-none focus:ring-2 focus:ring-blue-200"
                                style={{ minHeight: '40px', maxHeight: '80px' }}
                              />
                              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">Send</Button>
                            </form>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {/* Resolution Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={open => { if (!open) setShowSummaryDialog(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolution Summary</DialogTitle>
          </DialogHeader>
          <div className="mb-2 text-gray-700">Please provide a summary of how this signal was resolved.</div>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            value={resolutionSummary}
            onChange={e => setResolutionSummary(e.target.value)}
            placeholder="Describe the resolution..."
            disabled={summarySubmitting}
            autoFocus
          />
          {summaryError && <div className="text-red-600 text-sm mt-1">{summaryError}</div>}
          <DialogFooter>
            <Button onClick={handleSubmitSummary} disabled={summarySubmitting} className="bg-green-600 hover:bg-green-700 rounded-lg">Submit</Button>
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={() => setShowSummaryDialog(false)}>&apos;Cancel&apos;</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
