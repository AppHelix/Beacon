"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SidebarLayout } from "@/components/SidebarLayout";
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

export default function SignalDetailPage() {
  const params = useParams();
  const id = params && 'id' in params ? params.id : undefined;
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSignal() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/signals/${id}`);
        if (!res.ok) throw new Error("Failed to fetch signal");
        const data = await res.json();
        setSignal(data);
      } catch (err) {
        setError("Failed to load signal");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSignal();
  }, [id]);

  if (loading) return <SidebarLayout title="Signal Detail"><div className="p-8">Loading...</div></SidebarLayout>;
  if (error || !signal) return <SidebarLayout title="Signal Detail"><div className="p-8 text-red-600">{error || "Signal not found"}</div></SidebarLayout>;

  return (
    <SidebarLayout title={signal.title} description={`Signal #${signal.id}`}>
      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="bg-indigo-100 text-indigo-700">{signal.status}</Badge>
            <Badge className="bg-yellow-100 text-yellow-700">{signal.urgency}</Badge>
            <Badge className="bg-slate-100 text-slate-700">Engagement: {signal.engagementId}</Badge>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Problem Statement</h2>
            <p className="text-slate-700">{signal.description}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold">Required Skills</h3>
            <p>{signal.requiredSkills || "-"}</p>
          </div>
          <div className="text-xs text-slate-500">
            <div>Created by: {signal.createdBy}</div>
            <div>Created: {new Date(signal.createdAt).toLocaleString()}</div>
            <div>Last updated: {new Date(signal.updatedAt).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
