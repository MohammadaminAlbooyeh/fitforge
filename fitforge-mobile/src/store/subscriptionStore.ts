import { create } from 'zustand';

import { fetchEntitlements } from '@/api/subscriptions';
import { Entitlements } from '@/api/types';

type SubscriptionState = {
  entitlements: Entitlements | null;
  loading: boolean;
  error: string | null;
  isPro: boolean;
  refresh: (userId: number) => Promise<void>;
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

  refresh: async (userId) => {
    set({ loading: true, error: null });
    try {
      const entitlements = await fetchEntitlements(userId);
      set({ entitlements, loading: false, isPro: isPro(entitlements) });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load entitlements', loading: false });
    }
  },

  setEntitlements: (entitlements) =>
    set({ entitlements, isPro: isPro(entitlements) }),
}));