import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';

export function NutritionLogScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Button title="Add food entry" onPress={() => navigation.navigate('NutritionEntry')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
