import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const { entitlements, loading, error, isPro, refresh, setEntitlements } =
    useSubscriptionStore();

  useEffect(() => {
    if (user) {
      refresh(user.id);
    } else {
      setEntitlements(null);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { entitlements, loading, error, isPro, refresh };
}