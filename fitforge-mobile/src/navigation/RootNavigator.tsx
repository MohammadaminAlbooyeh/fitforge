import React from 'react';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

type Props = {
  isAuthenticated: boolean;
};

export function RootNavigator({ isAuthenticated }: Props) {
  if (!isAuthenticated) {
    return <AuthStack />;
  }
  return <MainTabs />;
}