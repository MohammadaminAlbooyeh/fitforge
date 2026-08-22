"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllExercises } from "@/lib/api";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";
import { AppShell } from "@/components/AppShell";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("all");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (muscleGroup !== "all" && e.muscle_group !== muscleGroup) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, query, muscleGroup]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-text">Exercises</h1>
          <span className="text-sm text-muted">{filtered.length} found</span>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
        />

        <div className="card !p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text">Target Muscle</h2>
              <p className="text-[13px] text-muted">Select target muscle group</p>
            </div>
            <Link
              href="/target-muscle"
              className="text-[12px] font-semibold text-primary hover:underline"
            >
              Full screen →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMuscleGroup("all")}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
                muscleGroup === "all"
                  ? "border-primary bg-primarysoft text-primary"
                  : "border-line bg-transparent text-muted"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  muscleGroup === "all" ? "border-primary bg-primary text-white" : "border-line"
                }`}
              >
                {muscleGroup === "all" && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              All
            </button>
            {muscleGroups.map((m) => {
              const active = muscleGroup === m;
              return (
                <button
                  key={m}
                  onClick={() => setMuscleGroup(m)}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold capitalize transition ${
                    active ? "border-primary bg-primarysoft text-primary" : "border-line bg-transparent text-muted"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      active ? "border-primary bg-primary text-white" : "border-line"
                    }`}
                  >
                    {active && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-muted">No exercises match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((exercise) => (
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
                  <span className="capitalize">{exercise.muscle_group}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}