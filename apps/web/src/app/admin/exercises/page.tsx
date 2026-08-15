"use client";

import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import NavBar from "@/components/NavBar";
import { apiFetch } from "@/lib/api";
import {
  DIFFICULTY_LEVELS,
  EQUIPMENT_TYPES,
  Exercise,
  MOVEMENT_ROLES,
  MUSCLE_GROUPS,
} from "@/lib/types";

const emptyForm = {
  name: "",
  muscle_group: MUSCLE_GROUPS[0],
  equipment: EQUIPMENT_TYPES[0],
  difficulty: DIFFICULTY_LEVELS[0],
  movement_role: MOVEMENT_ROLES[1],
  instructions: "",
};

export default function ExercisesPage() {
  return (
    <AuthGate>
      <NavBar />
      <ExercisesBody />
    </AuthGate>
  );
}

function ExercisesBody() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Exercise[]>("/exercises/?limit=100");
      setExercises(data);
    } catch {
      setError("Could not load exercises.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  const grouped = useMemo(() => {
    const byMuscle = new Map<string, Exercise[]>();
    for (const ex of exercises) {
      const list = byMuscle.get(ex.muscle_group) ?? [];
      list.push(ex);
      byMuscle.set(ex.muscle_group, list);
    }
    return MUSCLE_GROUPS.filter((m) => byMuscle.has(m)).map((m) => ({
      muscleGroup: m,
      items: byMuscle.get(m)!,
    }));
  }, [exercises]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<Exercise>("/exercises/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await load();
    } catch {
      setError("Could not create exercise. Check the name isn't already taken.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 space-y-8 p-6">
      <section>
        <h1 className="mb-4 text-lg font-semibold">Exercise library</h1>
        {loading && <p className="text-sm text-black/60 dark:text-white/60">Loading…</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!loading && (
          <div className="overflow-x-auto rounded border border-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Muscle group</th>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ muscleGroup, items }) => (
                  <Fragment key={muscleGroup}>
                    <tr>
                      <td
                        colSpan={5}
                        className="bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary"
                      >
                        {muscleGroup} <span className="font-normal normal-case text-muted">({items.length})</span>
                      </td>
                    </tr>
                    {items.map((ex) => (
                      <tr key={ex.id} className="border-t border-black/10 dark:border-white/10">
                        <td className="px-3 py-2">{ex.name}</td>
                        <td className="px-3 py-2 capitalize">{ex.muscle_group}</td>
                        <td className="px-3 py-2">{ex.equipment}</td>
                        <td className="px-3 py-2">{ex.difficulty}</td>
                        <td className="px-3 py-2">{ex.movement_role}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
                {exercises.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-black/60 dark:text-white/60" colSpan={5}>
                      No exercises yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Add exercise</h2>
        <form onSubmit={handleCreate} className="grid max-w-xl grid-cols-2 gap-4">
          <label className="col-span-2 space-y-1 text-sm">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <label className="space-y-1 text-sm">
            Muscle group
            <select
              value={form.muscle_group}
              onChange={(e) => setForm({ ...form, muscle_group: e.target.value as typeof form.muscle_group })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Equipment
            <select
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value as typeof form.equipment })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {EQUIPMENT_TYPES.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as typeof form.difficulty })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            Movement role
            <select
              value={form.movement_role}
              onChange={(e) => setForm({ ...form, movement_role: e.target.value as typeof form.movement_role })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            >
              {MOVEMENT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 space-y-1 text-sm">
            Instructions
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full rounded border border-black/20 px-3 py-2 dark:border-white/20 dark:bg-transparent"
              rows={3}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {submitting ? "Adding..." : "Add exercise"}
          </button>
        </form>
      </section>
    </main>
  );
}
