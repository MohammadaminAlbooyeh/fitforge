// Hand-written, ergonomic API contracts shared across backend and mobile.
//
// For the fully generated, always-in-sync schema types, see
// shared/types/api-contracts.generated.ts, produced by
// ./shared/scripts/generate-api-contracts.sh and checked by CI
// (.github/workflows/api-contracts-sync.yml).

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
  image_url?: string | null;
  video_url?: string | null;
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

export interface WaterLogContract {
  id: number;
  log_date: string;
  amount_ml: number;
}

export interface DailyWaterSummaryContract {
  log_date: string;
  total_ml: number;
  cups: number;
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

// ---- subscriptions / entitlements ----

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
  image_url?: string | null;
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
  skipped: boolean;
  target_weight_kg?: number | null;
}

export interface PlanDayExerciseUpdateContract {
  exercise_id?: number;
  skipped?: boolean;
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
  is_personal_record: boolean;
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

export interface PersonalRecordContract {
  id: number;
  exercise: ExerciseLibraryContract;
  weight_kg?: number | null;
  reps: number;
  set_number: number;
  completed_at: string;
}

// ---- Body measurements ----

export interface BodyMeasurementContract {
  id: number;
  date: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  arms_cm?: number | null;
  thighs_cm?: number | null;
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;
}

// ---- Gamification ----

export interface AchievementContract {
  id: number;
  user_id: number;
  badge_type: string;
  name: string;
  description: string;
  icon: string;
  xp_earned: number;
  earned_at: string;
}

export interface UserXPContract {
  id: number;
  user_id: number;
  total_xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_workout_date?: string | null;
}

export interface GamificationSummaryContract {
  xp: UserXPContract;
  achievements: AchievementContract[];
  next_level_xp: number;
}

// ---- Social ----

export interface UserPublicProfileContract {
  user_id: number;
  full_name: string;
  avatar_url: string | null;
  streak_days: number;
  level: number;
  workout_count: number;
  is_following: boolean;
}

export interface LeaderboardEntryContract {
  user_id: number;
  full_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
}

export interface ChallengeContract {
  id: number;
  title: string;
  description: string | null;
  challenge_type: string;
  start_date: string;
  end_date: string;
  goal_count: number;
  created_by: number;
  created_at: string;
  participants?: ChallengeParticipantContract[];
  my_workouts_completed?: number;
}

export interface ChallengeParticipantContract {
  user_id: number;
  full_name: string;
  workouts_completed: number;
}

// ---- Analytics ----

export interface ActivityFeedItemContract {
  user_id: number;
  full_name: string;
  workout_name?: string | null;
  performed_at: string;
  notes?: string | null;
  set_count: number;
}

export interface WeeklyVolumeContract {
  week_start: string;
  workouts: number;
  total_sets: number;
  total_volume_kg: number;
}

export interface MonthlyVolumeContract {
  month: string;
  workouts: number;
  total_sets: number;
  total_volume_kg: number;
}

export interface StrengthStandardContract {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  bodyweight_ratio?: number | null;
  standard_level?: string | null;
  bodyweight_kg?: number | null;
  estimated_1rm?: number | null;
}

export interface RecoveryInsightContract {
  recovery_score: number;
  fatigue_level: string;
  suggestion?: string | null;
}

export interface ExerciseProgressionContract {
  exercise_id: number;
  exercise_name: string;
  best_weight?: number | null;
  best_reps?: number | null;
  estimated_1rm?: number | null;
  previous_1rm?: number | null;
  total_sets: number;
  sessions: number;
}

export interface BodyTrendContract {
  date: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  arms_cm?: number | null;
}

export interface EnhancedAnalyticsContract {
  summary: AnalyticsSummaryContract;
  weekly_volume: WeeklyVolumeContract[];
  monthly_volume: MonthlyVolumeContract[];
  strength_standards: StrengthStandardContract[];
  recovery: RecoveryInsightContract;
  exercise_progression: ExerciseProgressionContract[];
  body_trend: BodyTrendContract[];
  streak_days: number;
  longest_streak: number;
}

export interface AnalyticsSummaryContract {
  total_workouts: number;
  total_sessions: number;
  total_sets: number;
  most_recent_workout?: string | null;
}
