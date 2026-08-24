import { getActiveWorkoutPlan } from './workoutPlans';
import { PlanDay, PlanDayExercise } from './types';

export async function getDailyPlan(offset = 0): Promise<PlanDay | null> {
  const plan = await getActiveWorkoutPlan();
  if (!plan || !plan.plan_days.length) return null;
  const today = new Date().getDay();
  const mappedToday = today === 0 ? 6 : today - 1;
  const todayDay = plan.plan_days.find((d) => d.weekday === mappedToday);
  if (todayDay) return todayDay;
  return plan.plan_days[Math.min(offset, plan.plan_days.length - 1)] ?? null;
}

export async function getWeeklyPlan(): Promise<PlanDay[]> {
  const plan = await getActiveWorkoutPlan();
  return plan?.plan_days ?? [];
}

export type { PlanDay, PlanDayExercise };
