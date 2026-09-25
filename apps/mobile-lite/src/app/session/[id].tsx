import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';

export default function SessionDetailScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const exerciseList = useWorkoutStore((s) => s.exerciseList);
  const loadExercises = useWorkoutStore((s) => s.loadExercises);
  const logSet = useWorkoutStore((s) => s.logSet);
  const completeSession = useWorkoutStore((s) => s.completeSession);

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [setCount, setSetCount] = useState(0);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleAddSet = async () => {
    if (!selectedExercise || !reps || !sessionId) return;
    const nextSetNumber = setCount + 1;
    await logSet(sessionId, selectedExercise, nextSetNumber, Number(reps), Number(weight || 0));
    setSetCount(nextSetNumber);
    setReps('');
    setWeight('');
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    await completeSession(sessionId);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Pick exercise</Text>
      <FlatList
        horizontal
        data={exerciseList}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, selectedExercise === item.id && styles.chipActive]}
            onPress={() => {
              setSelectedExercise(item.id);
              setSetCount(0);
            }}
          >
            <Text style={[styles.chipText, selectedExercise === item.id && styles.chipTextActive]}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      {selectedExercise && (
        <View style={styles.setForm}>
          <TextInput
            style={styles.setInput}
            placeholder="Reps"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
          <TextInput
            style={styles.setInput}
            placeholder="Weight (kg)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <Pressable style={styles.addSetButton} onPress={handleAddSet}>
            <Text style={styles.addSetButtonText}>Add set #{setCount + 1}</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <Pressable style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0d0d0f' },
  sectionLabel: { color: '#aaa', fontSize: 14, marginBottom: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#1a1a1e',
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#3d7eff' },
  chipText: { color: '#ccc', fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  setForm: { marginTop: 24 },
  setInput: {
    backgroundColor: '#1a1a1e',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  addSetButton: { backgroundColor: '#2a2a2e', padding: 14, borderRadius: 10, alignItems: 'center' },
  addSetButtonText: { color: '#fff', fontWeight: '600' },
  finishButton: { backgroundColor: '#3d7eff', padding: 16, borderRadius: 12, alignItems: 'center' },
  finishButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
