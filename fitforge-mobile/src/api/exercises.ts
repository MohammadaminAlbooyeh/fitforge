import { api } from './client';
import { Exercise } from './types';

export async function listExercises(params?: {
  muscleGroup?: string;
  offset?: number;
  limit?: number;
}): Promise<Exercise[]> {
  const { data } = await api.get<Exercise[]>('/exercises/', {
    params: {
      muscle_group: params?.muscleGroup,
      offset: params?.offset,
      limit: params?.limit,
    },
  });
  return data;
}
