import type {
  UserContract,
  WorkoutContract,
  WorkoutSessionContract,
  ExerciseLibraryContract,
  NutritionLogContract,
  DailyNutritionSummaryContract,
  DailyWorkoutPlanContract,
  WorkoutPlanContract,
  WorkoutLogContract,
  PersonalRecordContract,
  BodyMeasurementContract,
  GamificationSummaryContract,
  EnhancedAnalyticsContract,
  AnalyticsSummaryContract,
  LeaderboardEntryContract,
  ChallengeContract,
  ActivityFeedItemContract,
  EntitlementsContract,
} from "@shared/types/api-contracts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "fitforge_user_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) clearToken();
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail ?? body);
    } catch {
      /* keep statusText */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Auth ----

export type LoginInput = { email: string; password: string };
export type SignupInput = { email: string; full_name: string; password: string };
export type AuthResponse = { access_token: string; token_type: string; user?: UserContract };

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function signup(input: SignupInput) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---- Users ----

export type UserUpdateInput = Partial<{
  full_name: string | null;
  gender: string | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  experience_level: string | null;
  available_days_per_week: number | null;
  available_equipment: string[] | null;
}>;

export const fetchProfile = () => apiFetch<UserContract>("/users/me");
export const updateProfile = (input: UserUpdateInput) =>
  apiFetch<UserContract>("/users/me", { method: "PATCH", body: JSON.stringify(input) });

// ---- Workouts ----

export type WorkoutExerciseInput = {
  exercise_id: number;
  sets?: number;
  reps?: number | null;
  weight_kg?: number | null;
};

export type WorkoutCreateInput = {
  name: string;
  description?: string | null;
  exercises?: WorkoutExerciseInput[];
};

export type WorkoutSessionCreateInput = {
  performed_at?: string | null;
  notes?: string | null;
  sets?: { exercise_id: number; weight_kg?: number | null; reps?: number | null }[];
};

export const listWorkouts = () => apiFetch<WorkoutContract[]>("/workouts/");
export const getWorkout = (id: number) => apiFetch<WorkoutContract>(`/workouts/${id}`);
export const createWorkout = (input: WorkoutCreateInput) =>
  apiFetch<WorkoutContract>("/workouts/", { method: "POST", body: JSON.stringify(input) });
export const deleteWorkout = (id: number) =>
  apiFetch<void>(`/workouts/${id}`, { method: "DELETE" });
export const createWorkoutSession = (workoutId: number, input: WorkoutSessionCreateInput) =>
  apiFetch<WorkoutSessionContract>(`/workouts/${workoutId}/sessions`, {
    method: "POST",
    body: JSON.stringify(input),
  });

// ---- Exercises ----

export const listExercises = (params?: { muscle_group?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.muscle_group) qs.set("muscle_group", params.muscle_group);
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<ExerciseLibraryContract[]>(`/exercises/${suffix}`);
};

// ---- Nutrition ----

export type NutritionLogCreateInput = {
  log_date: string;
  meal?: string | null;
  food_item: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};

export const createNutritionLog = (input: NutritionLogCreateInput) =>
  apiFetch<NutritionLogContract>("/nutrition/", { method: "POST", body: JSON.stringify(input) });
export const getDailySummary = (day: string) =>
  apiFetch<DailyNutritionSummaryContract>(`/nutrition/day?day=${encodeURIComponent(day)}`);
export const getEntriesForDay = (day: string) =>
  apiFetch<NutritionLogContract[]>(`/nutrition/day/entries?day=${encodeURIComponent(day)}`);
export const deleteNutritionLog = (id: number) =>
  apiFetch<void>(`/nutrition/${id}`, { method: "DELETE" });

// ---- Plans (static Hevy) ----

export const getDailyPlan = (offset = 0) =>
  apiFetch<DailyWorkoutPlanContract>(`/plans/daily?offset=${offset}`);
export const getWeeklyPlan = () => apiFetch<DailyWorkoutPlanContract[]>("/plans/week");

// ---- Personalized plans ----

export type GeneratePlanRequest = { days_per_week: number };

export const generateWorkoutPlan = (input: GeneratePlanRequest) =>
  apiFetch<WorkoutPlanContract>("/workout-plans/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getActiveWorkoutPlan = async (): Promise<WorkoutPlanContract | null> => {
  try {
    return await apiFetch<WorkoutPlanContract>("/workout-plans/active");
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
};

export const updatePlanDayExercise = (
  id: number,
  input: { exercise_id?: number; skipped?: boolean }
) =>
  apiFetch(`/workout-plans/plan-day-exercises/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

// ---- Workout logs ----

export type WorkoutLogCreateInput = {
  plan_day_id?: number | null;
  completed_at?: string | null;
  status?: "completed" | "partial";
  sets: { exercise_id: number; weight_kg?: number | null; reps: number; set_number: number }[];
};

export const createWorkoutLog = (input: WorkoutLogCreateInput) =>
  apiFetch<WorkoutLogContract>("/workout-logs/", { method: "POST", body: JSON.stringify(input) });
export const listWorkoutLogs = () => apiFetch<WorkoutLogContract[]>("/workout-logs/");
export const listPersonalRecords = () =>
  apiFetch<PersonalRecordContract[]>("/workout-logs/personal-records");

// ---- Body measurements ----

export type BodyMeasurementCreateInput = {
  date: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  arms_cm?: number | null;
  thighs_cm?: number | null;
  notes?: string | null;
};

export const listBodyMeasurements = () => apiFetch<BodyMeasurementContract[]>("/body-measurements/");
export const createBodyMeasurement = (input: BodyMeasurementCreateInput) =>
  apiFetch<BodyMeasurementContract>("/body-measurements/", {
    method: "POST",
    body: JSON.stringify(input),
  });

// ---- Gamification / social ----

export const getGamificationSummary = () =>
  apiFetch<GamificationSummaryContract>("/gamification/summary");
export const getLeaderboard = (limit = 20) =>
  apiFetch<LeaderboardEntryContract[]>(`/social/leaderboard?limit=${limit}`);
export const getChallenges = () => apiFetch<ChallengeContract[]>("/social/challenges");
export const getActivityFeed = (limit = 30) =>
  apiFetch<ActivityFeedItemContract[]>(`/social/feed?limit=${limit}`);
export const getEntitlements = () => apiFetch<EntitlementsContract>("/entitlements/me");

// ---- Analytics ----

export const getAnalyticsSummary = () => apiFetch<AnalyticsSummaryContract>("/analytics/summary");
export const getEnhancedAnalytics = () =>
  apiFetch<EnhancedAnalyticsContract>("/analytics/enhanced");