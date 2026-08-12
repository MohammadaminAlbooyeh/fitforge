import { create } from 'zustand';

import { listWorkouts } from '@/api/workouts';
import { Workout } from '@/api/types';

type WorkoutState = {
  workouts: Workout[];
  selected: Workout | null;
  loading: boolean;
  fetch: () => Promise<void>;
  select: (workout: Workout | null) => void;
};

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workouts: [],
  selected: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const workouts = await listWorkouts();
      set({ workouts, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  select: (selected) => set({ selected }),
}));