import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}