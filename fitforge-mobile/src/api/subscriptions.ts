import { api } from './client';
import { Entitlements } from './types';

export async function fetchEntitlements(userId: number): Promise<Entitlements> {
  const { data } = await api.get<Entitlements>('/entitlements/me');
  return data;
}