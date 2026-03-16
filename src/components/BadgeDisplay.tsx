'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface BadgeData {
  userId: string;
  badges: Badge[];
  totalBadges: number;
  availableBadges: number;
}

export function BadgeDisplay({ userId }: { userId: string }) {
  const [data, setData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch(`/api/badges/${encodeURIComponent(userId)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">Badges</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Loading badges...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">Badges</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">{error || 'No badges yet'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">Badges</CardTitle>
          </div>
          <BadgeUI variant="secondary" className="text-xs">
            {data.totalBadges} / {data.availableBadges} earned
          </BadgeUI>
        </div>
        <CardDescription>Achievements and milestones</CardDescription>
      </CardHeader>
      <CardContent>
        {data.badges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-2">No badges earned yet</p>
            <p className="text-sm text-slate-500">
              Create signals, help others, and resolve problems to earn badges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md ${badge.color} border-transparent`}
                title={badge.description}
              >
                <span className="text-4xl">{badge.icon}</span>
                <div className="text-center">
                  <p className="text-sm font-semibold">{badge.name}</p>
                  <p className="text-xs opacity-75 mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress hint */}
        {data.totalBadges > 0 && data.totalBadges < data.availableBadges && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              Keep contributing to unlock {data.availableBadges - data.totalBadges} more badges!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
