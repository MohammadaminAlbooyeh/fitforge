import { api } from './client';
import { Entitlements } from './types';

export async function fetchEntitlements(): Promise<Entitlements> {
  const { data } = await api.get<Entitlements>('/entitlements/me');
  return data;
}

export async function purchasePlan(productId?: string): Promise<Entitlements> {
  const { data } = await api.post<Entitlements>('/subscriptions/purchase', { productId });
  return data;
}

export async function cancelPlan(): Promise<Entitlements> {
  const { data } = await api.post<Entitlements>('/subscriptions/cancel');
  return data;
}