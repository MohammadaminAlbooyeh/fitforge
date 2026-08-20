"use client";

import { useEffect, useMemo, useState } from "react";
import { listExercises } from "@/lib/api";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";
import { AppShell } from "@/components/AppShell";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("all");

  useEffect(() => {
    listExercises({ limit: 100 })
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
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setMuscleGroup("all")}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
              muscleGroup === "all" ? "bg-primary text-white" : "bg-white text-text"
            }`}
          >
            All
          </button>
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setMuscleGroup(m)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold capitalize transition ${
                muscleGroup === m ? "bg-primary text-white" : "bg-white text-text"
              }`}
            >
              {m}
            </button>
          ))}
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
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary shadow"
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