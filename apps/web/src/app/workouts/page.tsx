"use client";

import Link from "next/link";
import { useAsync } from "@/lib/useAsync";
import { listWorkouts, deleteWorkout } from "@/lib/api";
import { Button, EmptyState } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

const ROW_ICONS = ["🏋️", "🦵", "🤸", "🚴", "🏃", "🧘"];

export default function WorkoutsPage() {
  const { data: workouts, loading, reload } = useAsync(listWorkouts, []);

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">My Workouts</h1>

      {loading ? (
        <p className="text-center text-muted">Loading…</p>
      ) : !workouts || workouts.length === 0 ? (
        <EmptyState
          icon="💪"
          title="No workouts yet"
          message="Create your first one to start tracking your training."
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((w, i) => (
            <div key={w.id} className="card flex cursor-pointer items-center gap-3 !p-3">
              <span className="grad-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl">
                {ROW_ICONS[i % ROW_ICONS.length]}
              </span>
              <Link href={`/workouts/${w.id}`} className="min-w-0 flex-1">
                <p className="truncate font-bold text-text">{w.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primarysoft text-primary">
                    ✓
                  </span>
                  {w.exercises.length} exercise{w.exercises.length === 1 ? "" : "s"}
                </p>
              </Link>
              <Link href={`/workouts/${w.id}`} className="text-muted">
                ›
              </Link>
              <button
                onClick={async () => {
                  if (confirm(`Delete "${w.name}"?`)) {
                    await deleteWorkout(w.id);
                    reload();
                  }
                }}
                className="ml-1 shrink-0 text-xs text-danger"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Link href="/plan">
          <Button variant="ghost">Today&apos;s plan</Button>
        </Link>
        <Link href="/workouts/new">
          <Button>New workout</Button>
        </Link>
      </div>
    </div>
    </AppShell>
  );
}