"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getActiveWorkoutPlan,
  createWorkoutLog,
  updatePlanDayExercise,
} from "@/lib/api";
import type { PlanDayContract, PlanDayExerciseContract } from "@shared/types/api-contracts";
import { Card, Button, EmptyState } from "@/components/ui";
import { AppShell } from "@/components/AppShell";

function midpointReps(repsRange: string): number {
  const [lo, hi] = repsRange.split("-").map((n) => parseInt(n, 10));
  if (Number.isFinite(lo) && Number.isFinite(hi)) return Math.round((lo + hi) / 2);
  return Number.isFinite(lo) ? lo : 10;
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Awaited<ReturnType<typeof getActiveWorkoutPlan>>>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [logging, setLogging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setPlan(await getActiveWorkoutPlan());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time plan load on mount
    load();
  }, []);

  if (loading) return <p className="py-20 text-center text-muted">Loading your plan…</p>;

  if (!plan) {
    return (
      <EmptyState
        icon="🏋️"
        title="No plan yet"
        message="Answer a few questions and we'll build a split around your schedule and equipment."
        action={
          <Link href="/plan/generate">
            <Button>Build my plan</Button>
          </Link>
        }
      />
    );
  }

  const selectedDay: PlanDayContract | null =
    plan.plan_days.find((d) => d.id === selectedDayId) ?? plan.plan_days[0] ?? null;

  if (!selectedDay) return null;

  const activeExercises = selectedDay.plan_day_exercises.filter((pde) => !pde.skipped);
  const doneCount = activeExercises.filter((pde) => checked[String(pde.id)]).length;
  const total = activeExercises.length;

  const handleLogSession = async () => {
    const doneExercises = activeExercises.filter((pde) => checked[String(pde.id)]);
    if (doneExercises.length === 0) {
      setMessage("Check off the exercises you completed first.");
      return;
    }
    setLogging(true);
    setMessage(null);
    try {
      const log = await createWorkoutLog({
        plan_day_id: selectedDay.id,
        status: doneExercises.length === total ? "completed" : "partial",
        sets: doneExercises.map((pde) => ({
          exercise_id: pde.exercise.id,
          weight_kg: pde.target_weight_kg ?? undefined,
          reps: midpointReps(pde.reps_range),
          set_number: 1,
        })),
      });
      setChecked({});
      const prCount = log.log_sets.filter((s) => s.is_personal_record).length;
      setMessage(
        prCount > 0
          ? `Session logged — ${prCount} new personal record${prCount > 1 ? "s" : ""}! 🏆`
          : "Session logged — added to your history."
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not log session");
    } finally {
      setLogging(false);
    }
  };

  const handleSkip = async (pde: PlanDayExerciseContract) => {
    await updatePlanDayExercise(pde.id, { skipped: !pde.skipped });
    setChecked((prev) => ({ ...prev, [String(pde.id)]: false }));
    load();
  };

  const handleReplace = async (pde: PlanDayExerciseContract) => {
    const alternativeId = pde.exercise.alternative_exercise_id;
    if (!alternativeId) {
      setMessage("No alternative available for this exercise yet.");
      return;
    }
    await updatePlanDayExercise(pde.id, { exercise_id: alternativeId });
    load();
  };

  return (
    <AppShell>
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-text">Exercise</h1>

      {/* Day strip */}
      <div className="flex flex-wrap gap-3">
        {plan.plan_days.map((day) => {
          const isSelected = day.id === selectedDay.id;
          return (
            <button key={day.id} onClick={() => setSelectedDayId(day.id)} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-muted">Day {day.day_number}</span>
              <span
                className={`flex h-10 items-center justify-center rounded-full px-2 text-xs font-bold ${
                  isSelected ? "bg-primary text-white" : "bg-white text-text"
                }`}
              >
                {day.title.slice(0, 2).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div>
        <p className="text-[13px] font-bold text-text">Your Progress: {doneCount}/{total}</p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-1.5 bg-accent"
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-text">{selectedDay.title}</h2>
      <p className="text-xs capitalize text-muted">
        {plan.split_type.replace(/_/g, " ")} · {plan.days_per_week} days/week
      </p>

      {selectedDay.plan_day_exercises.map((pde) => {
        const isDone = !!checked[String(pde.id)];
        return (
          <Card key={pde.id} className={pde.skipped ? "opacity-50" : ""}>
            <button
              onClick={() => {
                if (!pde.skipped)
                  setChecked((prev) => ({ ...prev, [String(pde.id)]: !prev[String(pde.id)] }));
              }}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                  isDone ? "border-success bg-success text-white" : "border-line"
                }`}
              >
                {isDone ? "✓" : ""}
              </span>
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-primarysoft">
                {pde.exercise.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pde.exercise.image_url}
                    alt={pde.exercise.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-primary">💪</span>
                )}
              </span>
              <span className="flex-1">
                <span className={`block text-sm font-bold text-text ${pde.skipped ? "line-through" : ""}`}>
                  {pde.exercise.name}
                </span>
                <span className="block text-xs text-muted">
                  {pde.sets} sets · {pde.reps_range} reps · rest {pde.rest_seconds}s
                  {pde.target_weight_kg ? ` · target ${pde.target_weight_kg}kg` : ""}
                </span>
                <span className="block text-[11px] capitalize text-muted">
                  {pde.exercise.muscle_group} · {pde.exercise.equipment}
                </span>
              </span>
            </button>
            {pde.exercise.video_url && !pde.skipped && (
              <a
                href={pde.exercise.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary"
              >
                ▶ Watch demo
              </a>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleSkip(pde)}
                className="flex-1 rounded-full bg-primarysoft py-2 text-xs font-bold text-primary"
              >
                {pde.skipped ? "Unskip" : "Skip"}
              </button>
              {!pde.skipped && pde.exercise.alternative_exercise_id && (
                <button
                  onClick={() => handleReplace(pde)}
                  className="flex-1 rounded-full bg-primarysoft py-2 text-xs font-bold text-primary"
                >
                  Replace
                </button>
              )}
            </div>
          </Card>
        );
      })}

      {message && <p className="text-sm text-primary">{message}</p>}

      <Button onClick={handleLogSession} disabled={logging} variant="accent">
        {logging ? "Logging…" : "Log this session"}
      </Button>
      <Link href="/plan/generate">
        <Button variant="ghost">Rebuild plan</Button>
      </Link>
    </div>
    </AppShell>
  );
}