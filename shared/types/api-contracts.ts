// API contracts shared across backend and mobile.
// Keep in sync with the backend OpenAPI schema at /api/v1/openapi.json.
// Generation (optional): run `openapi-typescript` against the live schema.

export interface UserContract {
  id: number;
  email: string;
  full_name: string;
  gender?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
  experience_level?: string | null;
  available_days_per_week?: number | null;
  available_equipment?: string[] | null;
}

export interface AuthResponseContract {
  access_token: string;
  token_type: 'bearer';
}

export interface WorkoutExerciseContract {
  id: number;
  exercise: ExerciseContract;
  sets: number;
  reps?: number | null;
  weight_kg?: number | null;
}

export interface WorkoutContract {
  id: number;
  name: string;
  description?: string | null;
  scheduled_at?: string | null;
  exercises: WorkoutExerciseContract[];
}

export interface ExerciseContract {
  id: number;
  name: string;
  muscle_group: string;
  instructions?: string | null;
}

export interface NutritionLogContract {
  id: number;
  log_date: string;
  meal?: string | null;
  food_item: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DailyNutritionSummaryContract {
  log_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}

export interface WorkoutSessionSetContract {
  exercise_id: number;
  weight_kg?: number | null;
  reps?: number | null;
}

export interface WorkoutSessionContract {
  id: number;
  workout_id: number;
  performed_at: string;
  notes?: string | null;
  sets: WorkoutSessionSetContract[];
}

// ---- fitforge-subscriptions (Java / Spring Boot) ----

export type SubscriptionPlanContract = 'FREE' | 'PRO';

export type SubscriptionStatusContract = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';

export interface EntitlementsContract {
  userId: number;
  plan: SubscriptionPlanContract;
  status: SubscriptionStatusContract;
  storeProductId?: string | null;
  currentPeriodEnd?: string | null;
}

export interface WebhookPayloadContract {
  type: string;
  appUserId: string;
  productId?: string;
  expirationAtMs?: number;
  purchasedAtMs?: number;
}

// ---- Daily workout plans (FastAPI /plans) ----

export interface PlanExerciseContract {
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  rest_seconds: number;
}

export interface DailyWorkoutPlanContract {
  day: number;
  weekday: string;
  title: string;
  focus: string;
  rest: boolean;
  duration_minutes: number;
  exercises: PlanExerciseContract[];
}

// ---- Personalized workout plan engine (FastAPI /workout-plans, /workout-logs) ----

export interface ExerciseLibraryContract {
  id: number;
  name: string;
  muscle_group: string;
  secondary_muscle_groups?: string[] | null;
  equipment: string;
  difficulty: string;
  movement_role: string;
  video_url?: string | null;
  instructions?: string | null;
  alternative_exercise_id?: number | null;
}

export interface PlanDayExerciseContract {
  id: number;
  exercise: ExerciseLibraryContract;
  sets: number;
  reps_range: string;
  rest_seconds: number;
  order_index: number;
}

export interface PlanDayContract {
  id: number;
  day_number: number;
  title: string;
  weekday?: number | null;
  plan_day_exercises: PlanDayExerciseContract[];
}

export interface WorkoutPlanContract {
  id: number;
  days_per_week: number;
  split_type: 'full_body' | 'upper_lower' | 'push_pull_legs';
  start_date: string;
  status: 'active' | 'archived';
  plan_days: PlanDayContract[];
}

export interface GeneratePlanRequestContract {
  days_per_week: number;
}

export interface LogSetInputContract {
  exercise_id: number;
  weight_kg?: number | null;
  reps: number;
  set_number: number;
}

export interface LogSetContract {
  id: number;
  exercise_id: number;
  weight_kg?: number | null;
  reps: number;
  set_number: number;
}

export interface WorkoutLogCreateContract {
  plan_day_id?: number | null;
  completed_at?: string | null;
  status?: 'completed' | 'partial';
  sets: LogSetInputContract[];
}

export interface WorkoutLogContract {
  id: number;
  plan_day_id?: number | null;
  completed_at: string;
  status: 'completed' | 'partial';
  log_sets: LogSetContract[];
}