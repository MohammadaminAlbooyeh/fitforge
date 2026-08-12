import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { updateProfile } from '@/api/auth';
import { generateWorkoutPlan } from '@/api/workoutPlans';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

const DAY_OPTIONS = [1, 2, 3, 4, 5];
const EQUIPMENT_OPTIONS = [
  { value: 'dumbbell', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'machine', label: 'Machines' },
  { value: 'cable', label: 'Cable' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Bands' },
];
const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function GeneratePlanScreen({ navigation }: any) {
  const { user, setUser } = useAuth();
  const [daysPerWeek, setDaysPerWeek] = useState(user?.available_days_per_week ?? 3);
  const [equipment, setEquipment] = useState<string[]>(user?.available_equipment ?? []);
  const [experience, setExperience] = useState(user?.experience_level ?? 'beginner');
  const [saving, setSaving] = useState(false);

  const toggleEquipment = (value: string) => {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleGenerate = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        experience_level: experience,
        available_days_per_week: daysPerWeek,
        available_equipment: equipment,
      });
      setUser(updated);
      await generateWorkoutPlan({ days_per_week: daysPerWeek });
      navigation.replace('DailyPlan');
    } catch (e: any) {
      Alert.alert('Could not generate plan', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Build your plan</Text>
      <Text style={styles.subtitle}>
        A few questions so we can generate a split that fits your schedule and equipment.
      </Text>

      <Card>
        <Text style={styles.cardTitle}>Days per week</Text>
        <View style={styles.chipRow}>
          {DAY_OPTIONS.map((n) => (
            <Text
              key={n}
              onPress={() => setDaysPerWeek(n)}
              style={[styles.chip, daysPerWeek === n && styles.chipActive]}
            >
              {n}
            </Text>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Experience level</Text>
        <View style={styles.chipRow}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <Text
              key={opt.value}
              onPress={() => setExperience(opt.value)}
              style={[styles.chip, experience === opt.value && styles.chipActive]}
            >
              {opt.label}
            </Text>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Available equipment</Text>
        <Text style={styles.cardSubtitle}>Bodyweight exercises are always included.</Text>
        <View style={styles.chipRow}>
          {EQUIPMENT_OPTIONS.map((opt) => (
            <Text
              key={opt.value}
              onPress={() => toggleEquipment(opt.value)}
              style={[styles.chip, equipment.includes(opt.value) && styles.chipActive]}
            >
              {opt.label}
            </Text>
          ))}
        </View>
      </Card>

      <Button title="Generate my plan" onPress={handleGenerate} loading={saving} variant="accent" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 13 },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  cardSubtitle: { color: theme.colors.muted, fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: '#FFFFFF',
  },
});
