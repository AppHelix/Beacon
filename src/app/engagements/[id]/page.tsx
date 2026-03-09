"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

const fetchEngagement = async (id: string): Promise<Engagement | null> => {
  try {
    const res = await fetch(`/api/engagements/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching engagement:", error);
    return null;
  }
};

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

export default function EngagementDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", urgency: "medium", requiredSkills: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const activeTab = (() => {
    const tab = (searchParams?.get("tab") ?? "overview").toLowerCase();
    if (tab === "signals") return "signals";
    if (tab === "details") return "details";
    return "overview";
  })();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchEngagement(params.id),
      fetchSignals()
    ])
      .then(([engagementData, signalsData]) => {
        if (!engagementData) {
          setError("Engagement not found");
        } else {
          setEngagement(engagementData);
          const relatedSignals = signalsData.filter(s => s.engagementId === engagementData.id);
          setSignals(relatedSignals);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load engagement details");
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

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
          <h1 className="text-4xl font-bold text-white mb-4">Engagement Details</h1>
          <p className="text-gray-300 mb-8">You need to be signed in to view engagement details.</p>
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

  if (isLoading) return (
    <SidebarLayout title="Engagement Details">
      <div className="text-slate-600">Loading...</div>
    </SidebarLayout>
  );

  if (error) return (
    <SidebarLayout title="Engagement Details">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-12 text-center text-red-600">{error}</CardContent>
      </Card>
    </SidebarLayout>
  );

  if (!engagement) return (
    <SidebarLayout title="Engagement Details">
      <Card className="border-slate-200">
        <CardContent className="py-12 text-center text-slate-600">Engagement not found</CardContent>
      </Card>
    </SidebarLayout>
  );

  let techTagsArray: string[] = [];
  if (engagement.techTags) {
    try {
      if (Array.isArray(engagement.techTags)) {
        techTagsArray = engagement.techTags;
      } else if (typeof engagement.techTags === 'string') {
        try {
          const parsed = JSON.parse(engagement.techTags);
          if (Array.isArray(parsed)) {
            techTagsArray = parsed;
          } else if (typeof parsed === 'string') {
            techTagsArray = parsed.split(',').map(t => t.trim()).filter(Boolean);
          } else {
            techTagsArray = [];
          }
        } catch {
          techTagsArray = engagement.techTags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
    } catch {
      techTagsArray = [];
    }
  }

  return (
    <SidebarLayout
      title={engagement.name}
      description={`Client: ${engagement.clientName}`}
    >
      {/* Back Link */}
      <div className="mb-6">
        <Button asChild variant="outline" className="rounded-lg border-slate-300">
          <Link href="/engagements">← Back to Catalog</Link>
        </Button>
      </div>

      {/* Engagement Header Card */}
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={
                    engagement.status === 'Active'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : engagement.status === 'Paused'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                  }
                >
                  {engagement.status}
                </Badge>
                <span className="text-sm text-slate-500">
                  Updated: {new Date(engagement.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {techTagsArray.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Tech Stack:</p>
                <div className="flex flex-wrap gap-2">
                  {techTagsArray.map((tag: string, idx: number) => (
                    <Badge key={idx} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card className="border-slate-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {[
            { key: "overview", label: "Overview" },
            { key: "signals", label: `Signals (${signals.length})` },
            { key: "details", label: "Details" },
          ].map(tab => (
            <Link
              key={tab.key}
              href={`/engagements/${params.id}?tab=${tab.key}`}
              className={`min-w-28 flex-1 px-4 py-3 text-center text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <CardContent className="p-6">
          {activeTab === "overview" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Description</h3>
              <p className="text-slate-600">
                {engagement.description || "No description provided"}
              </p>
            </div>
          )}

          {activeTab === "signals" && (
            <div>
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
                          body: JSON.stringify({ ...form, engagementId: engagement.id, createdBy: session?.user?.name || "" })
                        });
                        if (!res.ok) {
                          const data = await res.json();
                          setError(data.error || "Failed to create signal");
                        } else {
                          setOpen(false);
                          setForm({ title: "", description: "", urgency: "medium", requiredSkills: "" });
                          fetchSignals().then(data => setSignals(data.filter(s => s.engagementId === engagement.id)));
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
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Related Signals ({signals.length})
                </h3>
                {signals.length === 0 ? (
                  <p className="text-center text-slate-600">No signals linked to this engagement yet.</p>
                ) : (
                  <div className="space-y-4">
                    {signals.map(signal => (
                      <div key={signal.id} className="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <a href={`/signals/${signal.id}`} className="break-words font-semibold text-indigo-700 hover:underline">
                            {signal.title}
                          </a>
                          <Badge
                            className={
                              signal.urgency === 'high'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                : signal.urgency === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                : 'bg-green-100 text-green-700 hover:bg-green-100'
                            }
                          >
                            {signal.urgency}
                          </Badge>
                        </div>
                        <p className="mb-3 break-words text-sm text-slate-600">{signal.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            Status: <span className="font-semibold">{signal.status}</span>
                          </span>
                          <span>•</span>
                          <span>Created by: {signal.createdBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Created At</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {new Date(engagement.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Last Updated</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {new Date(engagement.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}