export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { workoutId: number };
  LogSession: { workoutId: number };
  WorkoutEditor: { workoutId?: number } | undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Nutrition: undefined;
  Workouts: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
  ManageSubscription: undefined;
  DailyPlan: undefined;
  GeneratePlan: undefined;
  WorkoutEditor: { workoutId?: number } | undefined;
  WorkoutDetail: { workoutId: number };
  LogSession: { workoutId: number };
  PRHistory: undefined;
  BodyMeasurements: undefined;
  Achievements: undefined;
  SocialFeed: undefined;
};

export type RootParamList = {
  Auth: undefined;
  Main: undefined;
};
