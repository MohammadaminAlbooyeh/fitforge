"use client";

import Link from "next/link";
import { useAsync } from "@/lib/useAsync";
import { getEnhancedAnalytics, listPersonalRecords, getGamificationSummary } from "@/lib/api";
import { Card, StatPill } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

function WeeklyVolumeChart({ weeks }: { weeks: { week_start: string; total_sets: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.total_sets));
  return (
    <div className="flex h-32 items-end gap-2">
      {weeks.slice(-8).map((w) => {
        const h = (w.total_sets / max) * 100;
        return (
          <div key={w.week_start} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-md grad-primary"
              style={{ height: `${Math.max(h, 4)}%` }}
            />
            <span className="text-[10px] text-muted">
              {new Date(w.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const { data: enhanced } = useAsync(getEnhancedAnalytics, []);
  const { data: records } = useAsync(listPersonalRecords, []);
  const { data: gamification } = useAsync(getGamificationSummary, []);

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Activity</h1>

      {/* Level / streak */}
      <Card>
        <div className="flex justify-around">
          <StatPill value={gamification?.xp.level ?? 0} label="Level" color="text-primary" />
          <StatPill value={enhanced?.streak_days ?? 0} label="Streak" color="text-accent" />
          <StatPill value={enhanced?.longest_streak ?? 0} label="Best streak" color="text-success" />
        </div>
        {gamification && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-line">
              <div
                className="h-2 rounded-full grad-primary"
                style={{
                  width: `${gamification.next_level_xp > 0 ? Math.min(100, (gamification.xp.total_xp / (gamification.xp.total_xp + gamification.next_level_xp)) * 100) : 100}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {gamification.xp.total_xp} XP · {gamification.achievements.length} achievements
            </p>
          </div>
        )}
      </Card>

      {/* Training summary */}
      {enhanced && (
        <Card title="Training Summary">
          <div className="flex justify-around">
            <StatPill value={enhanced.summary.total_workouts} label="Workouts" color="text-primary" />
            <StatPill value={enhanced.summary.total_sessions} label="Sessions" color="text-accent" />
            <StatPill value={enhanced.summary.total_sets} label="Sets" color="text-success" />
          </div>
        </Card>
      )}

      {/* Weekly volume */}
      {enhanced && enhanced.weekly_volume.length > 0 && (
        <Card title="Weekly volume">
          <WeeklyVolumeChart weeks={enhanced.weekly_volume} />
        </Card>
      )}

      {/* Personal records */}
      <Card title="Personal Records">
        {!records || records.length === 0 ? (
          <p className="text-sm text-muted">No personal records yet. Log some workouts!</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 5).map((pr) => (
              <div key={pr.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{pr.exercise.name}</p>
                  <p className="text-xs text-muted">
                    {pr.completed_at.slice(0, 10)} · {pr.weight_kg != null ? `${pr.weight_kg} kg` : ""} × {pr.reps}
                  </p>
                </div>
                <span className="text-lg">🏆</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/progress/records" className="mt-3 inline-block text-sm font-bold text-primary">
          View all →
        </Link>
      </Card>
    </div>
    </AppShell>
  );
}