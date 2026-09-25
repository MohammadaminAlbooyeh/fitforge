import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { useNutritionStore } from '../../store/nutritionStore';
import AppBannerAd from '../../components/AppBannerAd';

export default function NutritionScreen() {
  const todayEntries = useNutritionStore((s) => s.todayEntries);
  const loadToday = useNutritionStore((s) => s.loadToday);
  const addEntry = useNutritionStore((s) => s.addEntry);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);

  const handleAdd = async () => {
    if (!name.trim() || !calories) return;
    await addEntry(
      name.trim(),
      Number(calories),
      protein ? Number(protein) : undefined,
      carbs ? Number(carbs) : undefined,
      fat ? Number(fat) : undefined
    );
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.totalLabel}>Today: {totalCalories} kcal</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Food name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Calories"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Protein (g)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={protein}
            onChangeText={setProtein}
          />
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Carbs (g)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={carbs}
            onChangeText={setCarbs}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Fat (g)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={fat}
            onChangeText={setFat}
          />
        </View>
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add entry</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ flex: 1, marginTop: 16 }}
        data={todayEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <Text style={styles.entryName}>{item.name}</Text>
            <Text style={styles.entryCalories}>{item.calories} kcal</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing logged today.</Text>}
      />
      <AppBannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0d0d0f' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  totalLabel: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 16 },
  form: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  rowInput: { flex: 1 },
  input: {
    backgroundColor: '#1a1a1e',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  addButton: { backgroundColor: '#3d7eff', padding: 14, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '600' },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#1a1a1e',
    borderRadius: 10,
    marginBottom: 8,
  },
  entryName: { color: '#fff', fontSize: 15 },
  entryCalories: { color: '#888', fontSize: 14 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
});
