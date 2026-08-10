export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: number };
  LogSession: { workoutId: number };
};

export type MainTabsParamList = {
  Workouts: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootParamList = {
  Auth: undefined;
  Main: undefined;
};