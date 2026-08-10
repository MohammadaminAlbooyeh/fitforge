import { api } from './client';
import { Workout, WorkoutCreateInput } from './types';

export async function listWorkouts(): Promise<Workout[]> {
  const { data } = await api.get<Workout[]>('/workouts/');
  return data;
}

export async function getWorkout(id: number): Promise<Workout> {
  const { data } = await api.get<Workout>(`/workouts/${id}`);
  return data;
}

export async function createWorkout(input: WorkoutCreateInput): Promise<Workout> {
  const { data } = await api.post<Workout>('/workouts/', input);
  return data;
}

export async function deleteWorkout(id: number): Promise<void> {
  await api.delete(`/workouts/${id}`);
}