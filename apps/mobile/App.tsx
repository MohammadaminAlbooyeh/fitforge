import React, { useEffect } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import { initOfflineSync, stopOfflineSync } from '@/utils/offlineSync';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initOfflineSync();
    return () => stopOfflineSync();
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}