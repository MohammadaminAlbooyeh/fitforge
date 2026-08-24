"use client";

import { useEffect, useState } from "react";
import { getGamificationSummary } from "@/lib/api";
import type { GamificationSummaryContract } from "@shared/types/api-contracts";
import { Card, EmptyState, RingProgress } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

export default function AchievementsPage() {
  const [summary, setSummary] = useState<GamificationSummaryContract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGamificationSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><p className="py-20 text-center text-muted">Loading…</p></AppShell>;

  const xp = summary?.xp;
  const achievements = summary?.achievements ?? [];

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-text">Achievements</h1>
          <span className="text-sm text-muted">{achievements.length} unlocked</span>
        </div>

        {xp && (
          <Card className="flex items-center gap-4">
            <RingProgress
              value={xp.total_xp}
              max={summary?.next_level_xp ?? (xp.total_xp || 1)}
              size={72}
              strokeWidth={7}
              valueLabel={`Lv ${xp.level}`}
              label="Level"
            />
            <div>
              <p className="text-sm font-bold text-text">{xp.total_xp} XP</p>
              <p className="text-xs text-muted">
                {summary?.next_level_xp
                  ? `${Math.max(0, summary.next_level_xp - xp.total_xp)} XP to next level`
                  : "Keep training!"}
              </p>
            </div>
          </Card>
        )}

        {achievements.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="No achievements yet"
            message="Log workouts and hit milestones to start earning badges."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <Card key={a.id} className="flex items-center gap-3">
                <span className="text-3xl">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text">{a.name}</p>
                  <p className="text-xs text-muted">{a.description}</p>
                  <p className="mt-0.5 text-[11px] text-primary">
                    Earned {new Date(a.earned_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-primary">+{a.xp_earned} XP</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
