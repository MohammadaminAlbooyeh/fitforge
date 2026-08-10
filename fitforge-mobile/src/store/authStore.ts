import { create } from 'zustand';

import { fetchProfile } from '@/api/auth';
import { User } from '@/api/types';
import { persistAuth } from '@/api/client';
import { clearToken, getToken } from '@/utils/storage';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  finishAuth: (token: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  setLoading: (loading) => set({ loading }),

  finishAuth: async (token) => {
    await persistAuth(token);
    const user = await fetchProfile();
    set({ user, isAuthenticated: true });
  },

  restoreSession: async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const user = await fetchProfile();
      set({ user, isAuthenticated: true });
    } catch {
      await clearToken();
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    await clearToken();
    set({ user: null, isAuthenticated: false });
  },
}));