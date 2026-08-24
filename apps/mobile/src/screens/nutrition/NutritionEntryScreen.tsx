import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { createNutritionLog, updateNutritionLog } from '@/api/nutrition';
import type { NutritionLog } from '@/api/types';
import { toISODate } from '@/utils/formatters';
import { theme } from '@/constants/theme';

export function NutritionEntryScreen({ navigation, route }: any) {
  const existing = route?.params?.entry as NutritionLog | undefined;
  const [logDate, setLogDate] = useState(existing?.log_date ?? toISODate(new Date()));
  const [meal, setMeal] = useState(existing?.meal ?? '');
  const [foodItem, setFoodItem] = useState(existing?.food_item ?? '');
  const [calories, setCalories] = useState(existing?.calories != null ? String(existing.calories) : '');
  const [protein, setProtein] = useState(existing?.protein_g != null ? String(existing.protein_g) : '');
  const [carbs, setCarbs] = useState(existing?.carbs_g != null ? String(existing.carbs_g) : '');
  const [fat, setFat] = useState(existing?.fat_g != null ? String(existing.fat_g) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        log_date: logDate,
        meal: meal || undefined,
        food_item: foodItem,
        calories: calories ? Number(calories) : undefined,
        protein_g: protein ? Number(protein) : undefined,
        carbs_g: carbs ? Number(carbs) : undefined,
        fat_g: fat ? Number(fat) : undefined,
      };
      if (existing) {
        await updateNutritionLog(existing.id, payload);
      } else {
        await createNutritionLog(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save nutrition entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{existing ? 'Edit food entry' : 'Add food entry'}</Text>
      <Card style={styles.formCard}>
        <Input placeholder="YYYY-MM-DD" value={logDate} onChangeText={setLogDate} />
        <Input placeholder="Meal (breakfast, lunch, dinner…)" value={meal} onChangeText={setMeal} />
        <Input placeholder="Food item" value={foodItem} onChangeText={setFoodItem} />
        <View style={styles.row}>
          <Input
            style={styles.half}
            placeholder="Calories"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          <Input
            style={styles.half}
            placeholder="Protein (g)"
            keyboardType="numeric"
            value={protein}
            onChangeText={setProtein}
          />
        </View>
        <View style={styles.row}>
          <Input
            style={styles.half}
            placeholder="Carbs (g)"
            keyboardType="numeric"
            value={carbs}
            onChangeText={setCarbs}
          />
          <Input
            style={styles.half}
            placeholder="Fat (g)"
            keyboardType="numeric"
            value={fat}
            onChangeText={setFat}
          />
        </View>
      </Card>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title={existing ? 'Save changes' : 'Save entry'} onPress={handleSave} loading={saving} />
      {existing && <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  formCard: { gap: theme.spacing.sm },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  half: { flex: 1 },
  error: { color: theme.colors.danger },
});
