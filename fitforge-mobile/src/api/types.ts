import type {
  UserContract,
  WorkoutContract,
  WorkoutExerciseContract,
  ExerciseContract,
  WorkoutSessionContract,
  WorkoutSessionSetContract,
  NutritionLogContract,
  DailyNutritionSummaryContract,
  SubscriptionPlanContract,
  EntitlementsContract,
  ExerciseLibraryContract,
  PlanDayExerciseContract,
  PlanDayContract,
  WorkoutPlanContract,
  GeneratePlanRequestContract,
  LogSetInputContract,
  LogSetContract,
  WorkoutLogCreateContract,
  WorkoutLogContract,
} from '../../../shared/types/api-contracts';

export type User = UserContract;
export type Exercise = ExerciseContract;
export type WorkoutExercise = WorkoutExerciseContract;
export type Workout = WorkoutContract;
export type NutritionLog = NutritionLogContract;
export type DailyNutritionSummary = DailyNutritionSummaryContract;
export type SubscriptionPlan = SubscriptionPlanContract;
export type Entitlements = EntitlementsContract;
export type WorkoutSessionSetInput = WorkoutSessionSetContract;
export type WorkoutSession = WorkoutSessionContract;
export type ExerciseLibraryItem = ExerciseLibraryContract;
export type PlanDayExercise = PlanDayExerciseContract;
export type PlanDay = PlanDayContract;
export type WorkoutPlan = WorkoutPlanContract;
export type GeneratePlanRequest = GeneratePlanRequestContract;
export type LogSetInput = LogSetInputContract;
export type LogSet = LogSetContract;
export type WorkoutLogCreateInput = WorkoutLogCreateContract;
export type WorkoutLog = WorkoutLogContract;

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user?: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  full_name: string;
  password: string;
};

export type WorkoutExerciseInput = {
  exercise_id: number;
  sets?: number;
  reps?: number | null;
  weight_kg?: number | null;
};

export type WorkoutCreateInput = {
  name: string;
  description?: string | null;
  scheduled_at?: string | null;
  exercises?: WorkoutExerciseInput[];
};

export type WorkoutSessionCreateInput = {
  performed_at?: string | null;
  notes?: string | null;
  sets?: WorkoutSessionSetInput[];
};

export type AnalyticsSummary = {
  total_workouts: number;
  total_sessions: number;
  total_sets: number;
  most_recent_workout?: string | null;
};

export type UserUpdateInput = {
  gender?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
  experience_level?: string | null;
  available_days_per_week?: number | null;
  available_equipment?: string[] | null;
};

export type NutritionLogCreateInput = {
  log_date: string;
  meal?: string | null;
  food_item: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
};
