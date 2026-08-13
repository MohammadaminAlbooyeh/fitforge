import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import type { EnhancedAnalytics, WorkoutLog } from '@/api/types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Props = {
  enhanced: EnhancedAnalytics | null;
  logs: WorkoutLog[];
  weeklyTarget: number | null;
};

function bestDay(logs: WorkoutLog[]): string | null {
  const counts = new Array(7).fill(0);
  for (const l of logs) {
    const d = new Date(l.completed_at);
    counts[d.getDay()] += 1;
  }
  const max = Math.max(...counts);
  if (max === 0) return null;
  return WEEKDAYS[counts.indexOf(max)];
}

function thisWeekWorkouts(logs: WorkoutLog[]): number {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());
  return logs.filter((l) => new Date(l.completed_at) >= start).length;
}

function missedText(weeklyTarget: number | null, thisWeek: number): string | null {
  if (!weeklyTarget) return null;
  const missed = weeklyTarget - thisWeek;
  if (thisWeek === 0) return `No sessions yet this week — ${weeklyTarget} planned.`;
  if (missed > 0) return `${missed} session${missed > 1 ? 's' : ''} short of ${weeklyTarget} this week.`;
  return 'On target for the week. Nice work!';
}

function trendNote(enhanced: EnhancedAnalytics | null): string | null {
  const volume = enhanced?.weekly_volume ?? [];
  if (volume.length < 2) return null;
  const last = volume[volume.length - 1];
  const prev = volume[volume.length - 2];
  if (last.workouts > prev.workouts) return 'Volume is trending up 📈';
  if (last.workouts < prev.workouts) return 'Last week dipped — easy to bounce back.';
  return 'Consistent — keep it steady.';
}

export function InsightsCard({ enhanced, logs, weeklyTarget }: Props) {
  const best = bestDay(logs);
  const thisWeek = thisWeekWorkouts(logs);
  const missed = missedText(weeklyTarget, thisWeek);
  const trend = trendNote(enhanced);
  const notes = [trend, best ? `Best day: ${best}` : null, missed].filter(Boolean);

  return (
    <Card title="Insights">
      {enhanced ? (
        <View style={styles.stats}>
          <MiniStat label="Streak" value={`${enhanced.streak_days}d`} color={theme.colors.primary} />
          <MiniStat
            label="Sets"
            value={`${enhanced.summary.total_sets}`}
            color={theme.colors.accent}
          />
          <MiniStat
            label="This week"
            value={`${thisWeek}`}
            color={theme.colors.success}
          />
        </View>
      ) : null}

      {notes.length > 0 ? (
        <View style={styles.notes}>
          {notes.map((n) => (
            <View key={n} style={styles.noteRow}>
              <View style={styles.bullet} />
              <Text style={styles.noteText}>{n}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Complete a few workouts to unlock insights.</Text>
      )}
    </Card>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm },
  miniStat: { alignItems: 'center', gap: 2 },
  miniValue: { fontSize: 18, fontWeight: '800' },
  miniLabel: { fontSize: 11, color: theme.colors.muted },
  notes: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
  noteText: { color: theme.colors.text, fontSize: 13, flex: 1 },
  empty: { color: theme.colors.muted, fontSize: 13, marginTop: theme.spacing.sm },
});