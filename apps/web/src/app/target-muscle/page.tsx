"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllExercises } from "@/lib/api";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";
import { AppShell } from "@/components/AppShell";
import { BodyDiagram } from "@/components/BodyDiagram";

function CheckCircle({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
        active ? "border-primary bg-primary text-white" : "border-line text-transparent"
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function TargetMusclePage() {
  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [muscle, setMuscle] = useState<string | null>(null);
  const [side, setSide] = useState<"front" | "back">("front");

  useEffect(() => {
    listAllExercises()
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, []);

  const muscleGroups = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.muscle_group))).sort(),
    [exercises]
  );

  const results = useMemo(
    () => (muscle ? exercises.filter((e) => e.muscle_group === muscle) : []),
    [exercises, muscle]
  );

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <Link href="/exercises" className="text-[13px] font-semibold text-muted hover:text-primary">
            ← Exercises
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text">Target Muscle</h1>
          <p className="text-[13px] text-muted">Select target muscle group</p>
        </div>

        <div className="card !p-4">
          <div className="mb-3 flex justify-center gap-2">
            <button
              onClick={() => setSide("front")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                side === "front" ? "bg-primary text-white" : "bg-transparent text-muted"
              }`}
            >
              Front side
            </button>
            <button
              onClick={() => setSide("back")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${
                side === "back" ? "bg-primary text-white" : "bg-transparent text-muted"
              }`}
            >
              Back side
            </button>
          </div>
          <BodyDiagram
            side={side}
            selected={muscle}
            onSelect={(m) => setMuscle((prev) => (prev === m ? null : m))}
          />
          <p className="mt-2 text-center text-[12px] text-muted">Tap a muscle on the body to select it</p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-muted">Loading…</p>
        ) : (
          <div className="space-y-2.5">
            {muscleGroups.map((m) => {
              const active = muscle === m;
              const count = exercises.filter((e) => e.muscle_group === m).length;
              return (
                <button
                  key={m}
                  onClick={() => setMuscle(active ? null : m)}
                  className={`flex w-full items-center justify-between rounded-full border px-5 py-3.5 text-left text-sm font-semibold capitalize transition ${
                    active
                      ? "border-primary bg-primarysoft text-primary"
                      : "border-line bg-card text-text"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle active={active} />
                    {m}
                  </span>
                  <span className="text-[12px] font-medium text-muted">{count} exercises</span>
                </button>
              );
            })}
          </div>
        )}

        {muscle && (
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold capitalize text-text">{muscle} exercises</h2>
            {results.length === 0 ? (
              <p className="py-6 text-center text-muted">No exercises found for this muscle group.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((exercise) => (
                  <div key={exercise.id} className="card relative flex flex-col gap-2 !p-3">
                    {exercise.video_url && (
                      <a
                        href={exercise.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-card text-primary shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                        aria-label="Watch demo"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    )}
                    <span className="grad-primary flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl">
                      {exercise.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exercise.image_url}
                          alt={exercise.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">💪</span>
                      )}
                    </span>
                    <p className="truncate text-sm font-bold text-text">{exercise.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1 capitalize">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primarysoft text-primary">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
                            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                          </svg>
                        </span>
                        {exercise.difficulty}
                      </span>
                      <span className="capitalize">{exercise.equipment}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
