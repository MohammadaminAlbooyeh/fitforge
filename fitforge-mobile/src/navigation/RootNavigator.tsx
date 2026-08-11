import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { PaywallScreen } from '@/screens/subscription/PaywallScreen';
import { ManageSubscriptionScreen } from '@/screens/subscription/ManageSubscriptionScreen';
import { DailyPlanScreen } from '@/screens/plan/DailyPlanScreen';
import { GeneratePlanScreen } from '@/screens/plan/GeneratePlanScreen';
import { WorkoutDetailScreen } from '@/screens/workouts/WorkoutDetailScreen';
import { WorkoutEditorScreen } from '@/screens/workouts/WorkoutEditorScreen';
import { LogSessionScreen } from '@/screens/workouts/LogSessionScreen';
import { RootStackParamList } from './types';

type Props = {
  isAuthenticated: boolean;
};

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return <AuthStack />;
  }
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="MainTabs" component={MainTabs} />
      <Root.Screen name="Paywall" component={PaywallScreen} />
      <Root.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
      <Root.Screen name="DailyPlan" component={DailyPlanScreen} />
      <Root.Screen name="GeneratePlan" component={GeneratePlanScreen} />
      <Root.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Root.Screen name="WorkoutEditor" component={WorkoutEditorScreen} />
      <Root.Screen name="LogSession" component={LogSessionScreen} />
    </Root.Navigator>
  );
}