"use client";

import Link from "next/link";
import { useAsync } from "@/lib/useAsync";
import { listWorkouts, deleteWorkout } from "@/lib/api";
import { Card, Button, EmptyState } from "@/components/ui";

export default function WorkoutsPage() {
  const { data: workouts, loading, reload } = useAsync(listWorkouts, []);

  return (
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
          {workouts.map((w) => (
            <Card key={w.id} className="cursor-pointer">
              <div className="flex items-center justify-between">
                <Link href={`/workouts/${w.id}`} className="flex-1">
                  <p className="font-bold text-text">{w.name}</p>
                  <p className="text-sm text-muted">{w.exercises.length} exercise(s)</p>
                </Link>
                <button
                  onClick={async () => {
                    if (confirm(`Delete "${w.name}"?`)) {
                      await deleteWorkout(w.id);
                      reload();
                    }
                  }}
                  className="text-sm text-danger"
                >
                  Delete
                </button>
              </div>
            </Card>
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
  );
}