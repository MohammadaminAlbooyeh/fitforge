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
  PlanDayExerciseUpdateContract,
  PlanDayContract,
  WorkoutPlanContract,
  GeneratePlanRequestContract,
  LogSetInputContract,
  LogSetContract,
  WorkoutLogCreateContract,
  WorkoutLogContract,
  PersonalRecordContract,
  BodyMeasurementContract,
  AchievementContract,
  UserXPContract,
  GamificationSummaryContract,
  UserPublicProfileContract,
  LeaderboardEntryContract,
  ChallengeContract,
  ChallengeParticipantContract,
  WeeklyVolumeContract,
  ExerciseProgressionContract,
  BodyTrendContract,
  EnhancedAnalyticsContract,
  AnalyticsSummaryContract,
  ActivityFeedItemContract,
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
export type PlanDayExerciseUpdate = PlanDayExerciseUpdateContract;
export type PlanDay = PlanDayContract;
export type WorkoutPlan = WorkoutPlanContract;
export type GeneratePlanRequest = GeneratePlanRequestContract;
export type LogSetInput = LogSetInputContract;
export type LogSet = LogSetContract;
export type WorkoutLogCreateInput = WorkoutLogCreateContract;
export type WorkoutLog = WorkoutLogContract;
export type PersonalRecord = PersonalRecordContract;
export type BodyMeasurement = BodyMeasurementContract;
export type Achievement = AchievementContract;
export type UserXP = UserXPContract;
export type GamificationSummary = GamificationSummaryContract;
export type UserPublicProfile = UserPublicProfileContract;
export type LeaderboardEntry = LeaderboardEntryContract;
export type Challenge = ChallengeContract;
export type ChallengeParticipant = ChallengeParticipantContract;
export type ActivityFeedItem = ActivityFeedItemContract;
export type WeeklyVolume = WeeklyVolumeContract;
export type ExerciseProgression = ExerciseProgressionContract;
export type BodyTrend = BodyTrendContract;
export type EnhancedAnalytics = EnhancedAnalyticsContract;
export type AnalyticsSummary = AnalyticsSummaryContract;

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
