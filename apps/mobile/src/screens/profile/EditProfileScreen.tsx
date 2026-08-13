import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/api/auth';
import { theme } from '@/constants/theme';

const GOALS = [
  { value: '', label: 'No goal selected' },
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
];

export function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name ?? '');
    setBirthDate(user.birth_date ?? '');
    setHeightCm(user.height_cm != null ? String(user.height_cm) : '');
    setWeightKg(user.weight_kg != null ? String(user.weight_kg) : '');
    setGoal(user.goal ?? '');
    setDaysPerWeek(user.available_days_per_week != null ? String(user.available_days_per_week) : '');
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        full_name: fullName || null,
        birth_date: birthDate || null,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        goal: goal || null,
        available_days_per_week: daysPerWeek ? Number(daysPerWeek) : null,
      });
      setUser(updated);
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <Card title="Profile">
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" />
        <Field label="Birth date (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} placeholder="1990-01-01" />
        <Field label="Height (cm)" value={heightCm} onChangeText={setHeightCm} placeholder="175" keyboardType="numeric" />
        <Field label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="80" keyboardType="numeric" />
        <Field label="Workouts per week" value={daysPerWeek} onChangeText={setDaysPerWeek} placeholder="4" keyboardType="numeric" />
      </Card>

      <Card title="Fitness Goal">
        {GOALS.map((g) => (
          <View key={g.value} style={styles.goalRow} onTouchEnd={() => setGoal(g.value)}>
            <Ionicons
              name={goal === g.value ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={goal === g.value ? theme.colors.primary : theme.colors.muted}
            />
            <Text style={[styles.goalLabel, goal === g.value && styles.goalLabelSelected]}>{g.label}</Text>
          </View>
        ))}
      </Card>

      <Button title="Save changes" onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Input {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  field: { gap: theme.spacing.xs },
  fieldLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: 8, marginVertical: 2, borderRadius: 8, paddingHorizontal: 4 },
  goalLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  goalLabelSelected: { color: theme.colors.primary },
});