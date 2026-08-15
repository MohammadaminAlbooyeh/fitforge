"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAsync } from "@/lib/useAsync";
import { getWorkout } from "@/lib/api";
import { Card, Button } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: workout, loading } = useAsync(() => getWorkout(id), [id]);
  const [copied, setCopied] = useState(false);

  if (loading) return <p className="py-20 text-center text-muted">Loading…</p>;
  if (!workout) return <p className="py-20 text-center text-muted">Workout not found.</p>;

  const shareTemplate = () => {
    const lines = [
      `${workout.name}`,
      `${workout.description ?? ""}`.trim() ? `${workout.description}\n` : "",
      ...workout.exercises.map(
        (entry) =>
          `• ${entry.exercise.name} — ${entry.sets} sets${entry.reps != null ? ` × ${entry.reps} reps` : ""}${
            entry.weight_kg != null ? ` @ ${entry.weight_kg} kg` : ""
          }`
      ),
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AppShell>
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text">{workout.name}</h1>
          {workout.description && <p className="text-sm text-muted">{workout.description}</p>}
        </div>
        <button
          onClick={shareTemplate}
          className="flex-shrink-0 rounded-full bg-primarysoft px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
        >
          {copied ? "Copied!" : "⤴ Share as template"}
        </button>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((entry, i) => (
          <Card key={entry.id ?? i}>
            <div className="flex items-start gap-3">
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primarysoft">
                {entry.exercise.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.exercise.image_url}
                    alt={entry.exercise.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-primary">💪</span>
                )}
              </span>
              <div className="flex-1">
                <p className="font-bold text-text">{entry.exercise.name}</p>
                <p className="text-sm capitalize text-muted">{entry.exercise.muscle_group}</p>
                <p className="mt-2 text-sm text-muted">
                  {entry.sets} sets
                  {entry.reps != null ? ` · ${entry.reps} reps` : ""}
                  {entry.weight_kg != null ? ` · ${entry.weight_kg} kg` : ""}
                </p>
                {entry.exercise.video_url && (
                  <a
                    href={entry.exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-bold text-primary"
                  >
                    ▶ Watch demo
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Link href={`/workouts/${id}/log`}>
        <Button>Log session</Button>
      </Link>
    </div>
    </AppShell>
  );
}