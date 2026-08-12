import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { MacroDonut } from '@/components/common/MacroDonut';
import { useAuth } from '@/hooks/useAuth';
import { getDailySummary, getEntriesForDay } from '@/api/nutrition';
import { DailyNutritionSummary, NutritionLog } from '@/api/types';
import { toISODate } from '@/utils/formatters';
import { theme } from '@/constants/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function buildWeek(center: Date) {
  const day = (center.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(center);
  monday.setDate(center.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function NutritionLogScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Date());
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null);
  const [entries, setEntries] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const week = buildWeek(selected);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const day = toISODate(selected);
      const [s, e] = await Promise.all([getDailySummary(day), getEntriesForDay(day)]);
      setSummary(s);
      setEntries(e);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const grouped = entries.reduce<Record<string, NutritionLog[]>>((acc, entry) => {
    const key = entry.meal ?? 'other';
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selected.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
        </Text>
        <Avatar name={user?.full_name} size={36} />
      </View>

      <View style={styles.weekStrip}>
        {week.map((d, i) => {
          const isSelected = toISODate(d) === toISODate(selected);
          return (
            <View
              key={i}
              style={styles.dayColumn}
              onTouchEnd={() => setSelected(d)}
            >
              <Text style={styles.weekdayLabel}>{WEEKDAYS[i]}</Text>
              <View style={[styles.dayCircle, isSelected && styles.dayCircleActive]}>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                  {d.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Card style={styles.macroCard}>
        <MacroDonut
          size={110}
          strokeWidth={9}
          rings={[
            { value: summary?.total_protein_g ?? 0, max: 150, color: theme.colors.primary },
            { value: summary?.total_carbs_g ?? 0, max: 300, color: theme.colors.accent },
            { value: summary?.total_fat_g ?? 0, max: 90, color: theme.colors.success },
          ]}
        >
          <Text style={styles.macroTotal}>{Math.round(summary?.total_calories ?? 0)}</Text>
          <Text style={styles.macroTotalLabel}>cal</Text>
        </MacroDonut>
        <View style={styles.macroLegend}>
          <MacroLegendRow color={theme.colors.primary} label="Protein" value={summary?.total_protein_g} max={150} />
          <MacroLegendRow color={theme.colors.accent} label="Carbs" value={summary?.total_carbs_g} max={300} />
          <MacroLegendRow color={theme.colors.success} label="Fat" value={summary?.total_fat_g} max={90} />
        </View>
      </Card>

      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : entries.length === 0 ? (
        <Text style={styles.muted}>No meals logged for this day yet.</Text>
      ) : (
        Object.entries(grouped).map(([meal, items]) => (
          <Card key={meal}>
            <View style={styles.mealHeaderRow}>
              <Text style={styles.mealTitle}>
                {meal[0].toUpperCase() + meal.slice(1)}:{' '}
                {Math.round(items.reduce((sum, i) => sum + i.calories, 0))} cal
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
            </View>
            {items.map((item) => (
              <View key={item.id} style={styles.foodRow}>
                <View style={styles.foodIcon}>
                  <Ionicons name="restaurant-outline" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.foodName}>{item.food_item}</Text>
                <Text style={styles.foodCalories}>{Math.round(item.calories)}</Text>
              </View>
            ))}
          </Card>
        ))
      )}

      <Card onPress={() => navigation.navigate('NutritionEntry')} style={styles.addCard}>
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.addLabel}>Add food entry</Text>
      </Card>
    </ScrollView>
  );
}

function MacroLegendRow({
  color,
  label,
  value,
  max,
}: {
  color: string;
  label: string;
  value?: number;
  max: number;
}) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>
        {Math.round(value ?? 0)} of {max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', gap: 6 },
  weekdayLabel: { color: theme.colors.muted, fontSize: 12 },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: theme.colors.primary },
  dayNumber: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  dayNumberActive: { color: '#FFFFFF' },
  macroCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  macroTotal: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  macroTotalLabel: { color: theme.colors.muted, fontSize: 11 },
  macroLegend: { flex: 1, gap: theme.spacing.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: theme.colors.text, fontSize: 12, fontWeight: '600', flex: 1 },
  legendValue: { color: theme.colors.muted, fontSize: 11 },
  mealHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: 6 },
  foodIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  foodCalories: { color: theme.colors.muted, fontSize: 12 },
  addCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, justifyContent: 'center' },
  addLabel: { color: theme.colors.primary, fontWeight: '700' },
  muted: { color: theme.colors.muted, textAlign: 'center', marginTop: theme.spacing.md },
});
