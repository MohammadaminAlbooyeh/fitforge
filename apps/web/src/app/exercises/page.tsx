"use client";

import { useEffect, useMemo, useState } from "react";
import { listAllExercises } from "@/lib/api";
import type { ExerciseLibraryContract } from "@shared/types/api-contracts";
import { AppShell } from "@/components/AppShell";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseLibraryContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("all");

  useEffect(() => {
    listAllExercises()
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, []);

  const EQUIPMENT_TYPES = ["bodyweight", "dumbbell", "barbell", "machine", "cable", "kettlebell", "band"];

  const equipmentStats = useMemo(
    () =>
      EQUIPMENT_TYPES.map((eq) => {
        const matches = exercises.filter((e) => e.equipment === eq);
        return { equipment: eq, count: matches.length, sample: matches[0] };
      }),
    [exercises]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (equipment !== "all" && e.equipment !== equipment) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, query, equipment]);

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
          <div className="mb-3">
            <h2 className="text-base font-bold text-text">Available equipment</h2>
            <p className="text-[13px] text-muted">Bodyweight exercises are always included.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="bg-line/60 text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-semibold">Equipment</th>
                  <th className="px-3 py-2 font-semibold">Exercise</th>
                  <th className="px-3 py-2 text-right font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  onClick={() => setEquipment("all")}
                  className={`cursor-pointer border-t border-line transition ${
                    equipment === "all" ? "bg-primarysoft" : "hover:bg-line/40"
                  }`}
                >
                  <td colSpan={2} className={`px-3 py-2.5 font-semibold capitalize ${equipment === "all" ? "text-primary" : "text-text"}`}>
                    All equipment
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold ${equipment === "all" ? "text-primary" : "text-text"}`}>
                    {exercises.length}
                  </td>
                </tr>
                {equipmentStats.map((row) => {
                  const active = equipment === row.equipment;
                  return (
                    <tr
                      key={row.equipment}
                      onClick={() => row.count > 0 && setEquipment(row.equipment)}
                      className={`border-t border-line transition ${
                        row.count === 0
                          ? "opacity-40"
                          : `cursor-pointer ${active ? "bg-primarysoft" : "hover:bg-line/40"}`
                      }`}
                    >
                      <td className={`px-3 py-2.5 font-semibold capitalize ${active ? "text-primary" : "text-text"}`}>
                        {row.equipment}
                      </td>
                      <td className="px-3 py-2.5">
                        {row.sample?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.sample.image_url}
                            alt={row.sample.name}
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primarysoft text-sm">💪</span>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-bold ${active ? "text-primary" : "text-text"}`}>
                        {row.count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-muted">No exercises match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filtered.map((exercise) => (
              <div key={exercise.id} className="card relative flex flex-col gap-2 !p-3">
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
                {exercise.video_url && (
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Watch the Demo
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