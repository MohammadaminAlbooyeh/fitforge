import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useWorkoutStore } from '../store/workoutStore';

export default function NewSessionScreen() {
  const startSession = useWorkoutStore((s) => s.startSession);
  const [name, setName] = useState('');

  const handleStart = async () => {
    const finalName = name.trim() || 'Workout';
    const sessionId = await startSession(finalName);
    router.replace(`/session/${sessionId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workout name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Push Day"
        placeholderTextColor="#666"
        autoFocus
      />
      <Pressable style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0d0d0f' },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a1e',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  startButton: { backgroundColor: '#3d7eff', padding: 16, borderRadius: 12, alignItems: 'center' },
  startButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
