'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, Clock } from 'lucide-react';

interface Engagement {
  id: number;
  name: string;
  clientName: string;
  status: string;
  description: string | null;
  techTags: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeaturedProjectData {
  engagement: Engagement;
  signalCount: number;
  activeContributors: number;
  recentActivity: Date;
  activityScore: number;
}

export function FeaturedProjectSpotlight() {
  const [featured, setFeatured] = useState<FeaturedProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        // Fetch engagements and signals to determine featured projects
        const [engagementsRes, signalsRes, contributionsRes] = await Promise.all([
          fetch('/api/engagements'),
          fetch('/api/signals'),
          fetch('/api/contributions?limit=100'),
        ]);

        if (!engagementsRes.ok || !signalsRes.ok || !contributionsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const engagements = await engagementsRes.json();
        const signals = await signalsRes.json();
        const contributions = await contributionsRes.json();

        // Calculate featured projects based on activity
        const featuredProjects = calculateFeatured(engagements, signals, contributions);
        setFeatured(featuredProjects);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, []);

  function calculateFeatured(
    engagements: Engagement[],
    signals: any[],
    contributions: any[]
  ): FeaturedProjectData[] {
    const engagementStats = engagements.map((engagement) => {
      // Count signals for this engagement
      const engagementSignals = signals.filter((s) => s.engagementId === engagement.id);
      const signalCount = engagementSignals.length;

      // Get unique contributors for this engagement's signals
      const contributorSet = new Set<string>();
      contributions.forEach((c) => {
        if (c.entityType === 'signal' && engagementSignals.some((s) => s.id === c.entityId)) {
          contributorSet.add(c.userId);
        }
      });
      const activeContributors = contributorSet.size;

      // Find most recent activity
      const recentContributions = contributions
        .filter((c) => c.entityType === 'signal' && engagementSignals.some((s) => s.id === c.entityId))
        .map((c) => new Date(c.createdAt));
      
      const recentActivity = recentContributions.length > 0
        ? new Date(Math.max(...recentContributions.map((d) => d.getTime())))
        : new Date(engagement.updatedAt);

      // Calculate activity score (higher = more featured)
      // Recent activity gets bonus, more signals and contributors = higher score
      const daysSinceActivity = (Date.now() - recentActivity.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, 10 - daysSinceActivity); // Bonus for activities within 10 days
      const activityScore = signalCount * 10 + activeContributors * 15 + recencyBonus;

      return {
        engagement,
        signalCount,
        activeContributors,
        recentActivity,
        activityScore,
      };
    });

    // Sort by activity score and return top 3
    return engagementStats
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 3);
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'planning':
        return 'bg-blue-100 text-blue-700';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  function formatTimeAgo(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-xl font-semibold text-slate-900">
              Featured Projects
            </CardTitle>
          </div>
          <CardDescription>Most active engagements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Loading featured projects...</p>
        </CardContent>
      </Card>
    );
  }

  if (featured.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-xl font-semibold text-slate-900">
              Featured Projects
            </CardTitle>
          </div>
          <CardDescription>Most active engagements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">No featured projects yet. Start creating signals to see them here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <CardTitle className="text-2xl font-bold text-slate-900">
              Featured Projects
            </CardTitle>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
        <CardDescription className="text-base">Spotlight on the most active and engaging projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featured.map((project, index) => (
            <Card
              key={project.engagement.id}
              className="border-2 border-slate-200 bg-white hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {index === 0 && <span className="text-2xl">🏆</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <h3 className="text-lg font-bold text-slate-900">
                        {project.engagement.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Client: <span className="font-semibold">{project.engagement.clientName}</span>
                    </p>
                    {project.engagement.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                        {project.engagement.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(project.engagement.status)}>
                    {project.engagement.status}
                  </Badge>
                </div>

                {/* Activity Stats */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="rounded-full bg-blue-100 p-1.5">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700">
                      <span className="font-semibold">{project.signalCount}</span> signals
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="rounded-full bg-green-100 p-1.5">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">
                      <span className="font-semibold">{project.activeContributors}</span> contributors
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="rounded-full bg-purple-100 p-1.5">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-700">{formatTimeAgo(project.recentActivity)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Link href={`/engagements/${project.engagement.id}?tab=overview`}>
                    View Project Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
