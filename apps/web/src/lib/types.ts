export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "legs",
  "arms",
] as const;

export const EQUIPMENT_TYPES = [
  "bodyweight",
  "dumbbell",
  "barbell",
  "machine",
  "cable",
  "kettlebell",
  "band",
] as const;

export const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export const MOVEMENT_ROLES = ["compound", "isolation"] as const;

export interface Exercise {
  id: number;
  name: string;
  muscle_group: (typeof MUSCLE_GROUPS)[number];
  secondary_muscle_groups?: (typeof MUSCLE_GROUPS)[number][] | null;
  equipment: (typeof EQUIPMENT_TYPES)[number];
  difficulty: (typeof DIFFICULTY_LEVELS)[number];
  movement_role: (typeof MOVEMENT_ROLES)[number];
  video_url?: string | null;
  image_url?: string | null;
  instructions?: string | null;
  alternative_exercise_id?: number | null;
}

export interface EntitlementsResponse {
  userId: number;
  plan: string;
  status?: string | null;
  storeProductId?: string | null;
  currentPeriodEnd?: string | null;
}
