"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEnhancedAnalytics, listWorkoutLogs, fetchProfile } from "@/lib/api";
import { Card, StatPill, Button } from "@/components/ui";
import { AppShell } from "@/components/AppShell";
import type { EnhancedAnalyticsContract, WorkoutLogContract } from "@shared/types/api-contracts";

export default function GoalsPage() {
  const [enhanced, setEnhanced] = useState<EnhancedAnalyticsContract | null>(null);
  const [logs, setLogs] = useState<WorkoutLogContract[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);

  useEffect(() => {
    getEnhancedAnalytics().then(setEnhanced).catch(() => {});
    listWorkoutLogs().then(setLogs).catch(() => {});
    fetchProfile()
      .then((u) => {
        setDaysPerWeek(u.available_days_per_week ?? null);
        setWeight(u.weight_kg ?? null);
      })
      .catch(() => {});
  }, []);

  const thisWeek = logs.filter((l) => {
    const d = new Date(l.completed_at);
    const now = new Date();
    const day = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day);
    return d >= new Date(monday.setHours(0, 0, 0, 0));
  }).length;

  const target = daysPerWeek ?? 3;
  const adherence = Math.min(100, (thisWeek / target) * 100);

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Goals</h1>

      <Card>
        <div className="flex items-center justify-between">
          <p className="font-bold text-text">Primary Goal</p>
          <BadgeGoal />
        </div>
        <p className="mt-2 text-sm text-muted">Current weight: {weight ? `${weight} kg` : "—"}</p>
      </Card>

      <Card title="This Week" className="flex flex-col items-center">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 36 36" className="h-40 w-40 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="3"
              strokeDasharray={`${adherence}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-text">{thisWeek}</span>
            <span className="text-xs text-muted">of {target} workouts</span>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-around">
          <StatPill value={thisWeek} label="Completed" color="text-success" />
          <StatPill value={target} label="Target" color="text-primary" />
          <StatPill value={`${Math.round(adherence)}%`} label="Adherence" color="text-accent" />
        </div>
      </Card>

      <Card title="Streak">
        <div className="flex justify-around">
          <StatPill value={enhanced?.streak_days ?? 0} label="Current" color="text-accent" />
          <StatPill value={enhanced?.longest_streak ?? 0} label="Best" color="text-success" />
        </div>
      </Card>

      <Card title="All-time">
        <div className="flex justify-around">
          <StatPill value={enhanced?.summary.total_workouts ?? 0} label="Workouts" color="text-primary" />
          <StatPill value={enhanced?.summary.total_sessions ?? 0} label="Sessions" color="text-accent" />
          <StatPill value={enhanced?.summary.total_sets ?? 0} label="Sets" color="text-success" />
        </div>
      </Card>

      <Link href="/profile/edit">
        <Button variant="ghost">Edit goals</Button>
      </Link>
    </div>
    </AppShell>
  );
}

function BadgeGoal() {
  return <span className="rounded-full bg-primarysoft px-2.5 py-0.5 text-xs font-semibold text-primary">My goal</span>;
}