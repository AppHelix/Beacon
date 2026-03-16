'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Activity } from 'lucide-react';

interface ContributionStats {
  totalPoints: number;
  totalContributions: number;
  byActionType: Record<string, number>;
  byEntityType: Record<string, number>;
  recentActivity: Array<{
    actionType: string;
    entityType: string;
    entityId: number;
    entityTitle: string;
    points: number;
    createdAt: string;
  }>;
}

interface ContributionData {
  userId: string;
  stats: ContributionStats;
  total: number;
}

const actionTypeLabels: Record<string, string> = {
  signal_created: 'Created Signal',
  hand_raise: 'Raised Hand',
  suggestion: 'Made Suggestion',
  signal_resolved: 'Resolved Signal',
  team_joined: 'Joined Team',
};

const actionTypeColors: Record<string, string> = {
  signal_created: 'bg-blue-100 text-blue-700',
  hand_raise: 'bg-yellow-100 text-yellow-700',
  suggestion: 'bg-green-100 text-green-700',
  signal_resolved: 'bg-purple-100 text-purple-700',
  team_joined: 'bg-indigo-100 text-indigo-700',
};

export function ContributionHistory({ userId }: { userId: string }) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContributions() {
      try {
        const response = await fetch(`/api/contributions/${encodeURIComponent(userId)}?includeStats=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch contributions');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError('Failed to load contribution history');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchContributions();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Contribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Contribution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-3">
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total Points</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total Contributions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalContributions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Action Types</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Object.keys(stats.byActionType).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Breakdown */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Contribution Breakdown</CardTitle>
          <CardDescription>Your activity across different contribution types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.byActionType).map(([actionType, count]) => (
              <div key={actionType} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={actionTypeColors[actionType] || 'bg-gray-100 text-gray-700'}>
                    {actionTypeLabels[actionType] || actionType}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-slate-700">{count} times</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
          <CardDescription>Your latest contributions to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-slate-600">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={actionTypeColors[activity.actionType] || 'bg-gray-100 text-gray-700'}>
                        {actionTypeLabels[activity.actionType] || activity.actionType}
                      </Badge>
                      <span className="text-sm font-medium text-slate-700">+{activity.points} pts</span>
                    </div>
                    <p className="text-sm text-slate-600">{activity.entityTitle}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
