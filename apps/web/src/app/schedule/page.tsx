"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWeeklyPlan, listWorkoutLogs } from "@/lib/api";
import { Card } from "@/components/ui";
import { AppShell } from "@/components/AppShell";
import type { DailyWorkoutPlanContract, WorkoutLogContract } from "@shared/types/api-contracts";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SchedulePage() {
  const [week, setWeek] = useState<DailyWorkoutPlanContract[]>([]);
  const [logs, setLogs] = useState<WorkoutLogContract[]>([]);

  useEffect(() => {
    getWeeklyPlan().then(setWeek).catch(() => {});
    listWorkoutLogs().then(setLogs).catch(() => {});
  }, []);

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">This week&apos;s plan</h1>

      {week.length === 0 ? (
        <p className="text-center text-muted">No schedule available.</p>
      ) : (
        week.map((day, i) => {
          const isToday = i === todayIndex;
          const done = logs.some((l) => l.completed_at.slice(0, 10) === toISODate(new Date(new Date().getTime() - (todayIndex - i) * 86400000)));
          return (
            <Link key={i} href="/plan" className="block">
              <Card className={isToday ? "border-2 border-primary" : ""}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                      day.rest
                        ? "bg-line text-muted"
                        : done
                          ? "bg-success text-white"
                          : isToday
                            ? "bg-primary text-white"
                            : "bg-primarysoft text-primary"
                    }`}
                  >
                    {day.rest ? "🛏" : done ? "✓" : day.title.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-text">
                      {day.weekday} · {day.title}
                      {isToday && <span className="ml-2 rounded-full bg-primarysoft px-2 py-0.5 text-[10px] font-bold text-primary">Today</span>}
                    </p>
                    <p className="text-xs capitalize text-muted">{day.focus}</p>
                  </div>
                  <p className="text-xs text-muted">
                    {day.duration_minutes} min · {day.exercises.length} exercises
                  </p>
                </div>
              </Card>
            </Link>
          );
        })
      )}
    </div>
    </AppShell>
  );
}