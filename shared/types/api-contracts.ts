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