"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchProfile,
  getDailyPlan,
  getDailySummary,
  getEntriesForDay,
  listWorkoutLogs,
  getEnhancedAnalytics,
  getChallenges,
  getLeaderboard,
  getAnalyticsSummary,
} from "@/lib/api";
import type {
  UserContract,
  DailyWorkoutPlanContract,
  DailyNutritionSummaryContract,
  NutritionLogContract,
  WorkoutLogContract,
  EnhancedAnalyticsContract,
  ChallengeContract,
  LeaderboardEntryContract,
} from "@shared/types/api-contracts";
import { Card, Avatar, StatPill, Badge } from "@/components/ui";

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Feed = {
  user: UserContract | null;
  plan: DailyWorkoutPlanContract | null;
  nutrition: DailyNutritionSummaryContract | null;
  meals: NutritionLogContract[];
  logs: WorkoutLogContract[];
  enhanced: EnhancedAnalyticsContract | null;
  challenges: ChallengeContract[];
  leaderboard: LeaderboardEntryContract[];
  totalSessions: number | null;
  totalSets: number | null;
};

export default function HomePage() {
  const router = useRouter();
  const [feed, setFeed] = useState<Feed | null>(null);

  useEffect(() => {
    const today = toISODate(new Date());
    Promise.allSettled([
      fetchProfile(),
      getDailyPlan(),
      getDailySummary(today),
      getEntriesForDay(today),
      listWorkoutLogs(),
      getEnhancedAnalytics(),
      getChallenges(),
      getLeaderboard(),
      getAnalyticsSummary(),
    ]).then(([u, p, n, m, l, en, ch, lb, an]) => {
      const isFulfilled = <T,>(r: PromiseSettledResult<T>): r is PromiseFulfilledResult<T> =>
        r.status === "fulfilled";
      setFeed({
        user: isFulfilled(u) ? u.value : null,
        plan: isFulfilled(p) ? p.value : null,
        nutrition: isFulfilled(n) ? n.value : null,
        meals: isFulfilled(m) ? m.value : [],
        logs: isFulfilled(l) ? l.value : [],
        enhanced: isFulfilled(en) ? en.value : null,
        challenges: isFulfilled(ch) ? (ch.value ?? []) : [],
        leaderboard: isFulfilled(lb) ? (lb.value ?? []) : [],
        totalSessions: isFulfilled(an) ? an.value.total_sessions : null,
        totalSets: isFulfilled(an) ? an.value.total_sets : null,
      });
    });
  }, []);

  if (!feed) {
    return <div className="py-20 text-center text-muted">Loading…</div>;
  }

  const { user, plan, nutrition, meals, logs, enhanced, challenges, leaderboard } = feed;
  const firstName = (user?.full_name ?? "there").split(" ")[0];
  const todayLogged =
    logs.length > 0 &&
    logs.some((l) => l.completed_at.slice(0, 10) === toISODate(new Date()));
  const ctaLabel = plan && !plan.rest ? "Start today's workout" : "Explore workouts";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">Hey {firstName},</p>
          <h1 className="text-2xl font-extrabold text-text">
            {enhanced && enhanced.streak_days > 0 ? "Keep the streak alive" : "Get In Shape"}
          </h1>
          {user?.goal && (
            <p className="mt-1 text-sm text-muted">
              {user.goal === "lose_weight"
                ? "Let's crush today's workout."
                : user.goal === "gain_muscle"
                  ? "Time to build some muscle."
                  : "Stay consistent and feel great."}
            </p>
          )}
        </div>
        <Avatar name={user?.full_name ?? "You"} />
      </section>

      {/* Primary CTA */}
      <button
        onClick={() => router.push(plan && !plan.rest ? "/plan" : "/workouts")}
        className="w-full rounded-[22px] grad-primary p-5 text-left text-white shadow-lg"
      >
        <p className="text-sm opacity-80">
          {plan && !plan.rest ? plan.title : "No rest day today?"}
        </p>
        <p className="text-lg font-bold">{ctaLabel} →</p>
      </button>

      {/* Recommended next step */}
      {meals.length === 0 && (
        <Card className="grad-accent text-white" >
          <p className="font-semibold">Log your breakfast</p>
          <p className="text-sm opacity-90">Add what you ate to stay on track.</p>
        </Card>
      )}

      {/* Today summary */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text">Today</h3>
          <Badge color={todayLogged ? "success" : "accent"}>
            {todayLogged ? "Workout done" : "Workout pending"}
          </Badge>
        </div>
        <div className="mt-4 flex justify-around">
          <StatPill value={nutrition?.total_calories ?? 0} label="Calories" color="text-accent" />
          <StatPill value={logs.length} label="Workouts" color="text-primary" />
          <StatPill
            value={enhanced?.weekly_volume?.reduce((s, w) => s + w.total_sets, 0) ?? 0}
            label="Sets"
            color="text-success"
          />
        </div>
      </Card>

      {/* Goals */}
      <Card title="Goals">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Weight</span>
          <span className="font-semibold text-text">
            {user?.weight_kg ? `${user.weight_kg} kg` : "—"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Weekly goal</span>
          <span className="font-semibold text-text">
            {user?.available_days_per_week ? `${user.available_days_per_week} days/week` : "—"}
          </span>
        </div>
      </Card>

      {/* Insights */}
      <Card title="Insights">
        <div className="flex gap-6">
          <StatPill value={enhanced?.streak_days ?? 0} label="Streak" color="text-accent" />
          <StatPill
            value={enhanced?.weekly_volume?.reduce((s, w) => s + w.total_sets, 0) ?? 0}
            label="This week"
            color="text-primary"
          />
          <StatPill
            value={logs.reduce((s, l) => s + l.log_sets.length, 0)}
            label="Sets logged"
            color="text-success"
          />
        </div>
      </Card>

      {/* Community */}
      {(challenges.length > 0 || leaderboard.length > 0) && (
        <Card title="Community">
          {challenges[0] && (
            <Link href="/progress" className="block rounded-2xl bg-primarysoft p-3">
              <p className="font-semibold text-primary">{challenges[0].title}</p>
              <p className="text-xs text-muted">
                {challenges[0].my_workouts_completed ?? 0}/{challenges[0].goal_count} workouts
              </p>
            </Link>
          )}
          {leaderboard.slice(0, 3).map((e, i) => (
            <div
              key={e.user_id}
              className="mt-2 flex items-center justify-between rounded-xl px-2 py-1.5"
            >
              <span className="text-sm font-semibold text-text">
                {i + 1}. {e.full_name}
              </span>
              <span className="text-sm text-muted">{e.xp} XP</span>
            </div>
          ))}
        </Card>
      )}

      {/* Footer */}
      {(feed.totalSessions != null || feed.totalSets != null) && (
        <p className="text-center text-xs text-muted">
          {feed.totalSessions ?? 0} sessions · {feed.totalSets ?? 0} sets logged all-time
        </p>
      )}
    </div>
  );
}