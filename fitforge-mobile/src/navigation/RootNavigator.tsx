import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { PaywallScreen } from '@/screens/subscription/PaywallScreen';
import { ManageSubscriptionScreen } from '@/screens/subscription/ManageSubscriptionScreen';
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
    </Root.Navigator>
  );
}