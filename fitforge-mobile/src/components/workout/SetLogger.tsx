import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/common/Input';
import { theme } from '@/constants/theme';

type Props = {
  index: number;
  onChange: (field: 'weight' | 'reps', value: string) => void;
};

export function SetLogger({ index, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set {index + 1}</Text>
      <Input
        placeholder="Weight (kg)"
        keyboardType="numeric"
        onChangeText={(v) => onChange('weight', v)}
      />
      <Input
        placeholder="Reps"
        keyboardType="numeric"
        onChangeText={(v) => onChange('reps', v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  label: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
});