import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'accent';
};

export function Button({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const isGhost = variant === 'ghost';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        isGhost ? styles.ghost : variant === 'accent' ? styles.accent : styles.primary,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.label, isGhost && styles.ghostLabel]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: theme.colors.primary },
  accent: { backgroundColor: theme.colors.accent },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ghostLabel: { color: theme.colors.primary },
});
