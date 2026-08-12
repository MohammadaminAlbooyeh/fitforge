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
import { PRHistoryScreen } from '@/screens/progress/PRHistoryScreen';
import { BodyMeasurementsScreen } from '@/screens/progress/BodyMeasurementsScreen';
import { AddMeasurementScreen } from '@/screens/progress/AddMeasurementScreen';
import { AchievementsScreen } from '@/screens/social/AchievementsScreen';
import { SocialFeedScreen } from '@/screens/social/SocialFeedScreen';
import { NotificationSettingsScreen } from '@/screens/profile/NotificationSettingsScreen';
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
      <Root.Screen name="PRHistory" component={PRHistoryScreen} />
      <Root.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
      <Root.Screen name="AddMeasurement" component={AddMeasurementScreen} />
      <Root.Screen name="Achievements" component={AchievementsScreen} />
      <Root.Screen name="SocialFeed" component={SocialFeedScreen} />
      <Root.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </Root.Navigator>
  );
}
