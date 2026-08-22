"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listExercises } from "@/lib/api";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";

export default function ExercisePickerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("all");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset filters and load library when opening
    setQuery("");
    setMuscleGroup("all");
    listExercises({ limit: 100 })
      .then(setExercises)
      .catch(() => setExercises([]));
  }, [open]);

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

  if (!open) return null;

  const pick = (id: number) => {
    onClose();
    router.push(`/workouts/new?exercises=${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-3xl bg-card p-4 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-text">Pick an exercise</h2>
          <button onClick={onClose} className="text-muted" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mb-3 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full rounded-2xl border border-line bg-card px-4 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-primary"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setMuscleGroup("all")}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                muscleGroup === "all" ? "bg-primary text-white" : "bg-card text-text"
              }`}
            >
              All
            </button>
            {muscleGroups.map((m) => (
              <button
                key={m}
                onClick={() => setMuscleGroup(m)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  muscleGroup === m ? "bg-primary text-white" : "bg-card text-text"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No exercises found.</p>
          ) : (
            filtered.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => pick(exercise.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-2.5 text-left transition hover:border-primary"
              >
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primarysoft">
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
                  <p className="text-sm font-semibold text-text">{exercise.name}</p>
                  <p className="text-xs capitalize text-muted">
                    {exercise.muscle_group} · {exercise.equipment} · {exercise.difficulty}
                  </p>
                </div>
                <span className="flex-shrink-0 text-muted">›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}