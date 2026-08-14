"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkout, createWorkoutSession } from "@/lib/api";
import { Button, Input } from "@/components/ui";

type SetEntry = { weight: string; reps: string; completed: boolean };
type Group = {
  exerciseId: number;
  label: string;
  muscleGroup?: string | null;
  sets: SetEntry[];
};

export default function LogSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workoutId = Number(params.id);

  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWorkout(workoutId).then((w) => {
      setGroups(
        w.exercises.map((entry) => ({
          exerciseId: entry.exercise.id,
          label: entry.exercise.name,
          muscleGroup: entry.exercise.muscle_group,
          sets: Array.from({ length: entry.sets ?? 1 }, () => ({
            weight: entry.weight_kg != null ? String(entry.weight_kg) : "",
            reps: entry.reps != null ? String(entry.reps) : "",
            completed: false,
          })),
        }))
      );
    });
  }, [workoutId]);

  const updateSet = (gi: number, si: number, field: "weight" | "reps", value: string) => {
    setGroups((prev) => {
      const next = [...prev];
      const sets = [...next[gi].sets];
      sets[si] = { ...sets[si], [field]: value };
      next[gi] = { ...next[gi], sets };
      return next;
    });
  };

  const toggleComplete = (gi: number, si: number) => {
    setGroups((prev) => {
      const next = [...prev];
      const sets = [...next[gi].sets];
      sets[si] = { ...sets[si], completed: !sets[si].completed };
      next[gi] = { ...next[gi], sets };
      return next;
    });
  };

  const addSet = (gi: number) => {
    setGroups((prev) => {
      const next = [...prev];
      const sets = next[gi].sets;
      const last = sets[sets.length - 1];
      next[gi] = {
        ...next[gi],
        sets: [...sets, { weight: last?.weight ?? "", reps: last?.reps ?? "", completed: false }],
      };
      return next;
    });
  };

  const saveSession = async () => {
    setSaving(true);
    setError(null);
    try {
      await createWorkoutSession(workoutId, {
        sets: groups.flatMap((g) =>
          g.sets.map((s) => ({
            exercise_id: g.exerciseId,
            weight_kg: s.weight ? Number(s.weight) : undefined,
            reps: s.reps ? Number(s.reps) : undefined,
          }))
        ),
      });
      router.push(`/workouts/${workoutId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save session");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Log session</h1>

      {groups.map((g, gi) => (
        <div key={g.exerciseId} className="space-y-3 rounded-2xl bg-card p-4">
          <p className="text-lg font-bold text-text">{g.label}</p>
          {g.sets.map((set, si) => (
            <div key={si} className="flex items-center gap-3">
              <span className="w-6 text-sm font-semibold text-muted">S{si + 1}</span>
              <Input
                placeholder="kg"
                value={set.weight}
                onChange={(e) => updateSet(gi, si, "weight", e.target.value)}
                className="!w-20"
              />
              <Input
                placeholder="reps"
                value={set.reps}
                onChange={(e) => updateSet(gi, si, "reps", e.target.value)}
                className="!w-20"
              />
              <button
                onClick={() => toggleComplete(gi, si)}
                className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${
                  set.completed
                    ? "border-primary bg-primary text-white"
                    : "border-line text-muted"
                }`}
              >
                ✓
              </button>
            </div>
          ))}
          <button onClick={() => addSet(gi)} className="text-sm font-bold text-primary">
            + Add set
          </button>
        </div>
      ))}

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={saveSession} disabled={saving}>
        {saving ? "Saving…" : "Save session"}
      </Button>
    </div>
  );
}