import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { PersonalRecord } from '@/api/types';
import { theme } from '@/constants/theme';
import { getMuscleGroupVisual } from '@/utils/muscleGroupIcon';

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PRHistoryScreen({ navigation }: any) {
  const { records, loading, error, reload } = usePersonalRecords();

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Personal Records</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading && (
        <View style={styles.centered}>
          <Text style={styles.muted}>Loading your records…</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.muted}>{error}</Text>
          <Button title="Retry" variant="ghost" onPress={reload} />
        </View>
      )}

      {!loading && !error && records.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.muted}>
            No personal records yet — log a workout to start tracking your progress.
          </Text>
        </View>
      )}

      {!loading &&
        !error &&
        records.map((record: PersonalRecord) => {
          const visual = getMuscleGroupVisual(record.exercise.muscle_group);
          return (
            <Card key={record.id} style={styles.recordRow}>
              <View style={[styles.exerciseIcon, { backgroundColor: `${visual.color}22` }]}>
                <Ionicons name={visual.icon} size={20} color={visual.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{record.exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {record.weight_kg ?? '—'}kg × {record.reps}
                </Text>
                <Text style={[styles.exerciseSub, { color: visual.color }]}>
                  {visual.label} · {formatDate(record.completed_at)}
                </Text>
              </View>
              <Ionicons name="trophy" size={20} color={theme.colors.accent} />
            </Card>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  exerciseMeta: { color: theme.colors.muted, fontSize: 12 },
  exerciseSub: { color: theme.colors.muted, fontSize: 11, textTransform: 'capitalize' },
  muted: { color: theme.colors.muted, textAlign: 'center' },
});
