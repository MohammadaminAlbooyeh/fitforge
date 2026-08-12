import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/common/Input';
import { theme } from '@/constants/theme';

type Props = {
  index: number;
  label?: string;
  weight: string;
  reps: string;
  completed: boolean;
  onChange: (field: 'weight' | 'reps', value: string) => void;
  onToggleComplete: () => void;
};

export function SetLogger({ index, label, weight, reps, completed, onChange, onToggleComplete }: Props) {
  return (
    <View style={[styles.container, completed && styles.containerDone]}>
      <Text style={styles.label}>{label ? `${label}` : `Set ${index + 1}`}</Text>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <Input
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={weight}
            editable={!completed}
            onChangeText={(v) => onChange('weight', v)}
          />
        </View>
        <View style={styles.inputWrap}>
          <Input
            placeholder="Reps"
            keyboardType="numeric"
            value={reps}
            editable={!completed}
            onChangeText={(v) => onChange('reps', v)}
          />
        </View>
        <Pressable
          style={[styles.doneButton, completed && styles.doneButtonActive]}
          onPress={onToggleComplete}
        >
          <Text style={[styles.doneIcon, completed && styles.doneIconActive]}>
            {completed ? '✓' : ''}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  containerDone: { opacity: 0.6 },
  label: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  inputWrap: { flex: 1 },
  doneButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonActive: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  doneIcon: { fontSize: 18, fontWeight: '700', color: 'transparent' },
  doneIconActive: { color: '#FFFFFF' },
});
