import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function Card({ title, subtitle, onPress, children }: Props) {
  const content = (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '600' },
  subtitle: { color: theme.colors.muted, fontSize: 14 },
});