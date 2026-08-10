export type User = {
  id: number;
  email: string;
  full_name: string;
  gender?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
};

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

export type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  instructions?: string | null;
};

export type WorkoutExercise = {
  id: number;
  exercise: Exercise;
  sets: number;
  reps?: number | null;
  weight_kg?: number | null;
};

export type Workout = {
  id: number;
  name: string;
  description?: string | null;
  scheduled_at?: string | null;
  exercises: WorkoutExercise[];
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

export type NutritionLog = {
  id: number;
  log_date: string;
  meal?: string | null;
  food_item: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
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

export type DailyNutritionSummary = {
  log_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
};

export type SubscriptionPlan = 'FREE' | 'PRO';

export type Entitlements = {
  userId: number;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  storeProductId?: string | null;
  currentPeriodEnd?: string | null;
};