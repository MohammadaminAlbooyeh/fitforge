import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { theme } from '@/constants/theme';

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.muted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});