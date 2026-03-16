'use client';

import { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/SidebarLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalPoints: number;
  totalContributions: number;
  byActionType: Record<string, number>;
}

interface LeaderboardData {
  period: string;
  startDate: string;
  leaderboard: LeaderboardEntry[];
  totalUsers: number;
}

const periodOptions = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const actionTypeLabels: Record<string, string> = {
  signal_created: 'Signals Created',
  hand_raise: 'Hands Raised',
  suggestion: 'Suggestions',
  signal_resolved: 'Signals Resolved',
  team_joined: 'Teams Joined',
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/contributions/leaderboard?period=${period}&limit=20`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [period]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-6 w-6 text-slate-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 3:
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarLayout
      title="Leaderboard"
      description="Top contributors across the platform"
    >
      {/* Period Selector */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Time Period:</span>
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Period Info */}
      {data && (
        <div className="mb-6">
          <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Showing results for</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {periodOptions.find((p) => p.value === period)?.label}
                  </p>
                  {data.startDate !== 'all-time' && (
                    <p className="text-xs text-slate-600 mt-1">
                      Since {new Date(data.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">Active Contributors</p>
                  <p className="text-3xl font-bold text-indigo-600">{data.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <p className="text-slate-600">Loading leaderboard...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {!loading && !error && data && (
        <>
          {data.leaderboard.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="py-16 text-center">
                <p className="text-slate-600">No contributions yet for this period.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Top 3 - Special Cards */}
              {data.leaderboard.slice(0, 3).map((entry) => (
                <Card
                  key={entry.userId}
                  className={`border-2 shadow-lg ${
                    entry.rank === 1
                      ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50'
                      : entry.rank === 2
                      ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50'
                      : 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg font-bold">
                          {getUserInitials(entry.userName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-slate-900">{entry.userName}</h3>
                          <Badge className={`border ${getRankBadgeColor(entry.rank)}`}>
                            Rank #{entry.rank}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{entry.userId}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Points</p>
                          <p className="text-2xl font-bold text-indigo-600">{entry.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Contributions</p>
                          <p className="text-2xl font-bold text-slate-900">{entry.totalContributions}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contribution Breakdown */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-700 mb-2">Contribution Breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(entry.byActionType).map(([actionType, count]) => (
                          <Badge key={actionType} variant="outline" className="text-xs">
                            {actionTypeLabels[actionType] || actionType}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Rest of the leaderboard */}
              {data.leaderboard.length > 3 && (
                <Card className="border-slate-200 shadow-sm mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        Other Contributors
                      </div>
                    </CardTitle>
                    <CardDescription>Ranks 4-{Math.min(20, data.leaderboard.length)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.leaderboard.slice(3).map((entry) => (
                        <div
                          key={entry.userId}
                          className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 w-8">#{entry.rank}</span>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-semibold">
                                {getUserInitials(entry.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{entry.userName}</p>
                              <p className="text-xs text-slate-500">{entry.totalContributions} contributions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-indigo-600">{entry.totalPoints} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </SidebarLayout>
  );
}
