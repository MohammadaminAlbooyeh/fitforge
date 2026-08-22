"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkout, createWorkoutSession } from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

type SetEntry = { weight: string; reps: string; completed: boolean };
type Group = {
  exerciseId: number;
  label: string;
  muscleGroup?: string | null;
  sets: SetEntry[];
};

const PRESET_REST_SECONDS = [30, 60, 90, 120, 180];

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (interval.current) clearInterval(interval.current);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [onDone]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
      <p className="text-sm uppercase tracking-widest text-white/60">Rest</p>
      <p className="my-2 text-6xl font-extrabold tabular-nums">
        {mm}:{ss}
      </p>
      <Button variant="primary" onClick={onDone}>
        Skip rest
      </Button>
    </div>
  );
}

export default function LogSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workoutId = Number(params.id);

  const [groups, setGroups] = useState<Group[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supersetMode, setSupersetMode] = useState(false);
  const [autoRest, setAutoRest] = useState(true);
  const [restSeconds, setRestSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

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

      if (autoRest && !sets[si].completed) {
        const weight = Number(sets[si].weight) || 0;
        // Heavier sets get longer rest; compound-heavy picks from presets.
        const suggested = weight >= 80 ? 120 : weight >= 50 ? 90 : weight >= 20 ? 60 : 30;
        setRestSeconds(suggested || 60);
        setTimerKey((k) => k + 1);
        setTimerRunning(true);
      }
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
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">Log session</h1>

      {/* Session options */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-card p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-text">
          <input
            type="checkbox"
            checked={supersetMode}
            onChange={(e) => setSupersetMode(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Superset mode
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-text">
          <input
            type="checkbox"
            checked={autoRest}
            onChange={(e) => setAutoRest(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Auto-rest
        </label>
        {autoRest && (
          <select
            value={restSeconds}
            onChange={(e) => setRestSeconds(Number(e.target.value))}
            className="rounded-lg border border-line bg-card px-2 py-1 text-xs text-text"
          >
            {PRESET_REST_SECONDS.map((s) => (
              <option key={s} value={s}>
                {s}s rest
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Superset columns */}
      {supersetMode ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {groups.map((g, gi) => (
            <div key={g.exerciseId} className="w-56 shrink-0 space-y-3 rounded-2xl bg-card p-4">
              <p className="text-sm font-bold text-text">{g.label}</p>
              {g.sets.map((set, si) => (
                <div key={si} className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted">S{si + 1}</span>
                  <Input
                    placeholder="kg"
                    value={set.weight}
                    onChange={(e) => updateSet(gi, si, "weight", e.target.value)}
                  />
                  <Input
                    placeholder="reps"
                    value={set.reps}
                    onChange={(e) => updateSet(gi, si, "reps", e.target.value)}
                  />
                  <button
                    onClick={() => toggleComplete(gi, si)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
                      set.completed ? "border-primary bg-primary text-white" : "border-line text-muted"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              ))}
              <button onClick={() => addSet(gi)} className="text-xs font-bold text-primary">
                + Add set
              </button>
            </div>
          ))}
        </div>
      ) : (
        groups.map((g, gi) => (
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
        ))
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button onClick={saveSession} disabled={saving}>
        {saving ? "Saving…" : "Save session"}
      </Button>

      {timerRunning && autoRest && (
        <RestTimer
          key={timerKey}
          seconds={restSeconds}
          onDone={() => setTimerRunning(false)}
        />
      )}
    </div>
    </AppShell>
  );
}
