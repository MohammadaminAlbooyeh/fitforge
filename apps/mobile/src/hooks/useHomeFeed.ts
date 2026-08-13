import { useCallback, useEffect, useState } from 'react';

import { api } from '@/api/client';
import { fetchAnalyticsSummary } from '@/api/analytics';
import { getDailyPlan } from '@/api/plans';
import { getDailySummary, getEntriesForDay } from '@/api/nutrition';
import { listWorkoutLogs } from '@/api/workoutLogs';
import { toISODate } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useHealthSync } from '@/hooks/useHealthSync';
import type {
  AnalyticsSummary,
  Challenge,
  DailyWorkoutPlan,
  DailyNutritionSummary,
  EnhancedAnalytics,
  LeaderboardEntry,
  NutritionLog,
  WorkoutLog,
} from '@/api/types';

export type HomeFeed = {
  user: ReturnType<typeof useAuth>['user'];
  plan: DailyWorkoutPlan | null;
  nutrition: DailyNutritionSummary | null;
  meals: NutritionLog[];
  logs: WorkoutLog[];
  analytics: AnalyticsSummary | null;
  enhanced: EnhancedAnalytics | null;
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  steps: number;
  healthReady: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useHomeFeed(): HomeFeed {
  const { user } = useAuth();
  const {
    summary: health,
    ready: healthReady,
    refresh: refreshHealth,
  } = useHealthSync();

  const [plan, setPlan] = useState<DailyWorkoutPlan | null>(null);
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(null);
  const [meals, setMeals] = useState<NutritionLog[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [enhanced, setEnhanced] = useState<EnhancedAnalytics | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const today = toISODate(new Date());

    const [planRes, nutRes, mealsRes, logsRes, anRes, enRes, chRes, lbRes] =
      await Promise.allSettled([
        getDailyPlan(),
        getDailySummary(today),
        getEntriesForDay(today),
        listWorkoutLogs(),
        fetchAnalyticsSummary(),
        api.get('/analytics/enhanced'),
        api.get('/social/challenges'),
        api.get('/social/leaderboard'),
      ]);

    if (planRes.status === 'fulfilled') setPlan(planRes.value);
    if (nutRes.status === 'fulfilled') setNutrition(nutRes.value);
    if (mealsRes.status === 'fulfilled') setMeals(mealsRes.value);
    if (logsRes.status === 'fulfilled') setLogs(logsRes.value);
    if (anRes.status === 'fulfilled') setAnalytics(anRes.value);
    if (enRes.status === 'fulfilled') setEnhanced(enRes.value.data);
    if (chRes.status === 'fulfilled') setChallenges(chRes.value.data ?? []);
    if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value.data ?? []);

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    refreshHealth();
  }, [refresh, refreshHealth]);

  return {
    user,
    plan,
    nutrition,
    meals,
    logs,
    analytics,
    enhanced,
    challenges,
    leaderboard,
    steps: health.steps,
    healthReady,
    loading,
    refresh,
  };
}