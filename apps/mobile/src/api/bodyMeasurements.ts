import { api } from './client';
import { BodyMeasurement } from './types';

export async function listBodyMeasurements(): Promise<BodyMeasurement[]> {
  const { data } = await api.get<BodyMeasurement[]>('/body-measurements');
  return data;
}

export async function createBodyMeasurement(input: {
  date: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  arms_cm?: number | null;
  thighs_cm?: number | null;
  notes?: string | null;
  photo_url?: string | null;
}): Promise<BodyMeasurement> {
  const { data } = await api.post<BodyMeasurement>('/body-measurements', input);
  return data;
}

export async function updateBodyMeasurement(
  id: number,
  input: {
    weight_kg?: number | null;
    body_fat_pct?: number | null;
    chest_cm?: number | null;
    waist_cm?: number | null;
    arms_cm?: number | null;
    thighs_cm?: number | null;
    notes?: string | null;
    photo_url?: string | null;
  }
): Promise<BodyMeasurement> {
  const { data } = await api.patch<BodyMeasurement>(`/body-measurements/${id}`, input);
  return data;
}

export async function deleteBodyMeasurement(id: number): Promise<void> {
  await api.delete(`/body-measurements/${id}`);
}
