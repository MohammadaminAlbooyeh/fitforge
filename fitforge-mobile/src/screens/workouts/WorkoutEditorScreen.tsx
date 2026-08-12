import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import { createWorkout } from '@/api/workouts';
import { listExercises } from '@/api/exercises';
import { Exercise } from '@/api/types';

export function WorkoutEditorScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listExercises();
        setExercises(data);
      } catch {
        // exercise catalog is optional; workout can still be created without it
      } finally {
        setLoadingExercises(false);
      }
    })();
  }, []);

  const toggleExercise = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const workout = await createWorkout({
        name,
        description: description || undefined,
        exercises: selectedIds.map((exercise_id) => ({ exercise_id })),
      });
      navigation.goBack();
      navigation.navigate('WorkoutDetail', { workoutId: workout.id });
    } catch (e: any) {
      setError(e.message ?? 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New workout</Text>
      <Input placeholder="Workout name" value={name} onChangeText={setName} />
      <Input
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Card title="Exercises" subtitle="Pick exercises from the catalog to include.">
        {loadingExercises ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : exercises.length === 0 ? (
          <Text style={styles.empty}>No exercises available.</Text>
        ) : (
          <View style={styles.exerciseList}>
            {exercises.map((exercise) => {
              const selected = selectedIds.includes(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseRow, selected && styles.exerciseRowSelected]}
                  onPress={() => toggleExercise(exercise.id)}
                >
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMuscle}>{exercise.muscle_group}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selected ? theme.colors.primary : theme.colors.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>

      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Save workout" onPress={handleSave} loading={saving} disabled={!name.trim()} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold' },
  actions: { gap: theme.spacing.sm },
  error: { color: theme.colors.danger },
  empty: { color: theme.colors.muted, fontSize: 13 },
  exerciseList: { gap: theme.spacing.xs },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0EBFF',
  },
  exerciseInfo: { gap: 2 },
  exerciseName: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  exerciseMuscle: { color: theme.colors.muted, fontSize: 12, textTransform: 'capitalize' },
});
