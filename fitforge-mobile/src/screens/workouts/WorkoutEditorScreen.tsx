import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { theme } from '@/constants/theme';
import { createWorkout } from '@/api/workouts';

export function WorkoutEditorScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const workout = await createWorkout({ name, description: description || undefined, exercises: [] });
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
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Save workout" onPress={handleSave} loading={saving} />
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
});
