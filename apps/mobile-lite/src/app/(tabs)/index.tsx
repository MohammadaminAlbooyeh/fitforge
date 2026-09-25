import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';
import AppBannerAd from '../../components/AppBannerAd';

export default function HomeScreen() {
  const sessions = useWorkoutStore((s) => s.sessions);
  const loadSessions = useWorkoutStore((s) => s.loadSessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitForge Lite</Text>
      <Pressable style={styles.newButton} onPress={() => router.push('/new-session')}>
        <Text style={styles.newButtonText}>+ Start Workout</Text>
      </Pressable>
      <FlatList
        style={{ flex: 1 }}
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <Pressable style={styles.sessionRow} onPress={() => router.push(`/session/${item.id}`)}>
            <Text style={styles.sessionName}>{item.name}</Text>
            <Text style={styles.sessionDate}>{new Date(item.startedAt).toLocaleDateString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No workouts logged yet.</Text>}
      />
      <AppBannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0d0d0f' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20 },
  newButton: { backgroundColor: '#3d7eff', padding: 16, borderRadius: 12, alignItems: 'center' },
  newButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1e',
    borderRadius: 10,
    marginBottom: 10,
  },
  sessionName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  sessionDate: { color: '#888', fontSize: 14 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
