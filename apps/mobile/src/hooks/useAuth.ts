import { useCallback } from 'react';

import { loginRequest, signupRequest } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const res = await loginRequest({ email, password });
        await useAuthStore.getState().finishAuth(res.access_token);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const signup = useCallback(
    async (fullName: string, email: string, password: string) => {
      setLoading(true);
      try {
        const res = await signupRequest({ email, full_name: fullName, password });
        await useAuthStore.getState().finishAuth(res.access_token);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logout = useCallback(() => {
    useAuthStore.getState().logout();
  }, []);

  return { user, loading, login, signup, logout, setUser };
}