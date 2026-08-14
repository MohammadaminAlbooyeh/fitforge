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
          <div className="space-y-3">
            {filtered.map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primarysoft">
                  {exercise.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-primary">💪</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text">{exercise.name}</p>
                  <p className="text-xs capitalize text-muted">
                    {exercise.muscle_group} · {exercise.equipment} · {exercise.difficulty}
                  </p>
                  <p className="text-xs capitalize text-muted">{exercise.movement_role.replace(/_/g, " ")}</p>
                </div>
                {exercise.video_url && (
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 rounded-full bg-primarysoft px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    ▶ Demo
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}