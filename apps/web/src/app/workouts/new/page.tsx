"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkout, listExercises } from "@/lib/api";
import { Button, Input, Card } from "@/components/ui";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    listExercises()
      .then(setExercises)
      .catch(() => {})
      .finally(() => setLoadingExercises(false));
  }, []);

  const toggleExercise = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const workout = await createWorkout({
        name,
        description: description || undefined,
        exercises: selectedIds.map((exercise_id) => ({ exercise_id })),
      });
      router.push(`/workouts/${workout.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save workout");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-text">New workout</h1>

      <Input label="Workout name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Card title="Exercises" subtitle="Pick exercises from the catalog to include.">
        {loadingExercises ? (
          <p className="text-muted">Loading…</p>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-muted">No exercises available.</p>
        ) : (
          <div className="space-y-1.5">
            {exercises.map((exercise) => {
              const selected = selectedIds.includes(exercise.id);
              return (
                <button
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? "border-primary bg-primarysoft"
                      : "border-line bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primarysoft">
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
                    <div>
                      <p className="text-sm font-semibold text-text">{exercise.name}</p>
                      <p className="text-xs capitalize text-muted">{exercise.muscle_group}</p>
                      {exercise.video_url && (
                        <a
                          href={exercise.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 inline-block text-[11px] font-bold text-primary"
                        >
                          ▶ Watch demo
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`text-xl ${selected ? "text-primary" : "text-muted"}`}>
                    {selected ? "◉" : "○"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="space-y-2">
        <Button onClick={handleSave} disabled={!name.trim() || saving}>
          {saving ? "Saving…" : "Save workout"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}