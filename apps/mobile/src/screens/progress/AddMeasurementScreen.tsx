import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/api/client';
import { updateBodyMeasurement } from '@/api/bodyMeasurements';
import type { BodyMeasurement } from '@/api/types';
import { theme } from '@/constants/theme';

export function AddMeasurementScreen({ navigation, route }: any) {
  const existing = route.params?.measurement as BodyMeasurement | undefined;
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(existing?.date ?? today);
  const [weightKg, setWeightKg] = useState(existing?.weight_kg?.toString() ?? '');
  const [bodyFatPct, setBodyFatPct] = useState(existing?.body_fat_pct?.toString() ?? '');
  const [chestCm, setChestCm] = useState(existing?.chest_cm?.toString() ?? '');
  const [waistCm, setWaistCm] = useState(existing?.waist_cm?.toString() ?? '');
  const [armsCm, setArmsCm] = useState(existing?.arms_cm?.toString() ?? '');
  const [thighsCm, setThighsCm] = useState(existing?.thighs_cm?.toString() ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      navigation.setOptions({ title: 'Edit Measurement' });
    }
  }, [existing, navigation]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        date,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : null,
        chest_cm: chestCm ? parseFloat(chestCm) : null,
        waist_cm: waistCm ? parseFloat(waistCm) : null,
        arms_cm: armsCm ? parseFloat(armsCm) : null,
        thighs_cm: thighsCm ? parseFloat(thighsCm) : null,
        notes: notes || null,
      };
      if (existing) {
        await updateBodyMeasurement(existing.id, payload);
      } else {
        await api.post('/body-measurements', payload);
      }
      navigation.goBack();
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Failed to save measurement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{existing ? 'Edit Measurement' : 'Add Measurement'}</Text>

        <Input placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />

        <View style={styles.row}>
          <View style={styles.half}>
            <Input placeholder="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          </View>
          <View style={styles.half}>
            <Input placeholder="Body fat %" value={bodyFatPct} onChangeText={setBodyFatPct} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input placeholder="Chest (cm)" value={chestCm} onChangeText={setChestCm} keyboardType="decimal-pad" />
          </View>
          <View style={styles.half}>
            <Input placeholder="Waist (cm)" value={waistCm} onChangeText={setWaistCm} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input placeholder="Arms (cm)" value={armsCm} onChangeText={setArmsCm} keyboardType="decimal-pad" />
          </View>
          <View style={styles.half}>
            <Input placeholder="Thighs (cm)" value={thighsCm} onChangeText={setThighsCm} keyboardType="decimal-pad" />
          </View>
        </View>

        <Input placeholder="Notes" value={notes} onChangeText={setNotes} multiline />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.actions}>
          <Button title="Save" onPress={handleSave} loading={saving} />
          <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  half: { flex: 1 },
  actions: { gap: theme.spacing.sm },
  error: { color: theme.colors.danger, fontSize: 13 },
});
