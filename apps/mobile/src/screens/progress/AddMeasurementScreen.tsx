import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/api/client';
import { theme } from '@/constants/theme';

export function AddMeasurementScreen({ navigation }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [thighsCm, setThighsCm] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/body-measurements', {
        date,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : null,
        chest_cm: chestCm ? parseFloat(chestCm) : null,
        waist_cm: waistCm ? parseFloat(waistCm) : null,
        arms_cm: armsCm ? parseFloat(armsCm) : null,
        thighs_cm: thighsCm ? parseFloat(thighsCm) : null,
        notes: notes || null,
      });
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
        <Text style={styles.title}>Add Measurement</Text>

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
