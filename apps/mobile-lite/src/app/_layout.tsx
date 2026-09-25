import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { initDb } from '../db/client';
import { seedDefaultExercises } from '../db/seed';
import { requestAdsConsent } from '../ads/consent';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      await seedDefaultExercises();
      await requestAdsConsent();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0f' }}>
        <ActivityIndicator color="#3d7eff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-session" />
      <Stack.Screen name="session/[id]" />
    </Stack>
  );
}
