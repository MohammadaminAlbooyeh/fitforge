import { create } from 'zustand';

import { cancelPlan, fetchEntitlements, purchasePlan } from '@/api/subscriptions';
import { Entitlements } from '@/api/types';

type SubscriptionState = {
  entitlements: Entitlements | null;
  loading: boolean;
  error: string | null;
  isPro: boolean;
  refresh: () => Promise<void>;
  purchase: (productId?: string) => Promise<void>;
  cancel: () => Promise<void>;
  setEntitlements: (entitlements: Entitlements | null) => void;
};

function isPro(entitlements: Entitlements | null): boolean {
  return entitlements?.plan === 'PRO' && entitlements.status === 'ACTIVE';
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  entitlements: null,
  loading: false,
  error: null,
  isPro: false,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const entitlements = await fetchEntitlements();
      set({ entitlements, loading: false, isPro: isPro(entitlements) });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load entitlements', loading: false });
    }
  },

  purchase: async (productId?: string) => {
    set({ loading: true, error: null });
    try {
      const entitlements = await purchasePlan(productId);
      set({ entitlements, loading: false, isPro: isPro(entitlements) });
    } catch (e: any) {
      set({ error: e.message ?? 'Purchase failed', loading: false });
    }
  },

  cancel: async () => {
    set({ loading: true, error: null });
    try {
      const entitlements = await cancelPlan();
      set({ entitlements, loading: false, isPro: isPro(entitlements) });
    } catch (e: any) {
      set({ error: e.message ?? 'Cancel failed', loading: false });
    }
  },

  setEntitlements: (entitlements) =>
    set({ entitlements, isPro: isPro(entitlements) }),
}));