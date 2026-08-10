import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WorkoutListScreen } from '@/screens/workouts/WorkoutListScreen';
import { NutritionLogScreen } from '@/screens/nutrition/NutritionLogScreen';
import { ProgressScreen } from '@/screens/progress/ProgressScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Workouts" component={WorkoutListScreen} />
      <Tab.Screen name="Nutrition" component={NutritionLogScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}