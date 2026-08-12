import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/screens/home/HomeScreen';
import { WorkoutListScreen } from '@/screens/workouts/WorkoutListScreen';
import { NutritionLogScreen } from '@/screens/nutrition/NutritionLogScreen';
import { ProgressScreen } from '@/screens/progress/ProgressScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Nutrition" component={NutritionLogScreen} />
      <Tab.Screen name="Workouts" component={WorkoutListScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
