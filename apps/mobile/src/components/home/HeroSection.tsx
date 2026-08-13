import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';

type Props = {
  firstName: string;
  goal?: string | null;
  streakDays?: number;
  onPrimaryCTA: () => void;
  ctaLabel: string;
};

function motivationFor(goal: string | null | undefined, streak: number | undefined): string {
  const s = streak ?? 0;
  if (goal === 'gain_muscle') {
    return s > 0
      ? `Nice streak — ${s} days in a row. Progress is built today.`
      : 'Every rep counts. Let’s add some muscle today.';
  }
  if (goal === 'lose_weight') {
    return s > 0
      ? `${s}-day streak. Keep the momentum going.`
      : 'Small steps win the race. Start today.';
  }
  return s > 0
    ? `Strong work — ${s} straight days of effort.`
    : 'Ready to crush today? Your body will thank you.';
}

export function HeroSection({ firstName, goal, streakDays, onPrimaryCTA, ctaLabel }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hey {firstName},</Text>
          <Text style={styles.title}>{streakDays && streakDays > 0 ? 'Keep the streak alive' : 'Get In Shape'}</Text>
          <Text style={styles.motivation}>{motivationFor(goal, streakDays)}</Text>
        </View>
        <Avatar name={firstName} size={52} />
      </View>

      <Button title={ctaLabel} onPress={onPrimaryCTA} variant="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md },
  headerText: { flex: 1, gap: theme.spacing.xs },
  greeting: { color: theme.colors.muted, fontSize: 14 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  motivation: { color: theme.colors.muted, fontSize: 13, lineHeight: 19 },
});