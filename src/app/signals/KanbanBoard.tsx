"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const statusColumns = [
  { key: "open", label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export default function KanbanBoard({ signals, onStatusChange }: {
  signals: Signal[];
  onStatusChange: (id: number, newStatus: string) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {statusColumns.map(col => (
        <div key={col.key} className="flex-1 min-w-[300px]">
          <h2 className="mb-2 text-lg font-bold text-slate-700 text-center">{col.label}</h2>
          <div className="space-y-4">
            {signals.filter(s => s.status === col.key).map(signal => (
              <Card key={signal.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-indigo-700">{signal.title}</span>
                    <Badge>{signal.urgency}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{signal.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>Created by: {signal.createdBy}</span>
                    <span>Engagement ID: {signal.engagementId}</span>
                  </div>
                  <select
                    value={signal.status}
                    onChange={e => onStatusChange(signal.id, e.target.value)}
                    className="rounded border border-slate-300 p-1 text-xs"
                  >
                    {statusColumns.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
