"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (isLoading) return <div className="p-4 md:p-8">Loading...</div>;
  if (error) return <div className="p-4 md:p-8 text-red-600">{error}</div>;
  if (!engagement) return <div className="p-4 md:p-8">Engagement not found</div>;

  const techTagsArray = engagement.techTags
    ? JSON.parse(engagement.techTags)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Link href="/engagements" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Catalog
      </Link>

      <div className="bg-white rounded-none shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{engagement.name}</h1>
        <p className="text-gray-600 mb-4">Client: <span className="font-semibold">{engagement.clientName}</span></p>
        
        <div className="flex gap-4 mb-4">
          <span className={`px-3 py-1 rounded-none text-sm font-semibold ${
            engagement.status === 'Active' ? 'bg-green-100 text-green-700' :
            engagement.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {engagement.status}
          </span>
          <span className="text-sm text-gray-500">
            Updated: {new Date(engagement.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {techTagsArray.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Tech Tags:</p>
            <div className="flex flex-wrap gap-2">
              {techTagsArray.map((tag: string, idx: number) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-none text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-none shadow-md">
        <div className="flex border-b">
          {[
            { key: "overview", label: "Overview" },
            { key: "signals", label: "Signals" },
            { key: "details", label: "Details" },
          ].map(tab => (
            <Link
              key={tab.key}
              href={`/engagements/${params.id}?tab=${tab.key}`}
              className={`flex-1 px-4 py-3 text-center font-semibold border-b-2 transition ${
                activeTab === tab.key
                  ? "bg-blue-50 text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-gray-600">
                {engagement.description || "No description provided"}
              </p>
            </div>
          )}

          {activeTab === "signals" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Related Signals ({signals.length})</h3>
              {signals.length === 0 ? (
                <p className="text-gray-600">No signals linked to this engagement yet.</p>
              ) : (
                <div className="space-y-4">
                  {signals.map(signal => (
                    <div key={signal.id} className="border rounded-none p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{signal.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-none ${
                          signal.urgency === 'high' ? 'bg-red-100 text-red-700' :
                          signal.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {signal.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                      <p className="text-xs text-gray-500">
                        Status: <span className="font-semibold">{signal.status}</span> • Created by: {signal.createdBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-semibold">{new Date(engagement.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-semibold">{new Date(engagement.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}