import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { db } from '../../db/client';
import { workoutSessions, setLogs } from '../../db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import AppBannerAd from '../../components/AppBannerAd';

interface SessionSummary {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  setCount: number;
  totalVolumeKg: number;
}

export default function HistoryScreen() {
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);

  const load = useCallback(async () => {
    const sessions = await db.select().from(workoutSessions).orderBy(desc(workoutSessions.startedAt));

    const results: SessionSummary[] = [];
    for (const session of sessions) {
      const agg = await db
        .select({
          setCount: sql<number>`count(*)`,
          totalVolume: sql<number>`coalesce(sum(${setLogs.reps} * ${setLogs.weightKg}), 0)`,
        })
        .from(setLogs)
        .where(eq(setLogs.sessionId, session.id));

      results.push({
        id: session.id,
        name: session.name,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        setCount: agg[0]?.setCount ?? 0,
        totalVolumeKg: agg[0]?.totalVolume ?? 0,
      });
    }
    setSummaries(results);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      <FlatList
        style={{ flex: 1, marginTop: 16 }}
        data={summaries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.sessionName}>{item.name}</Text>
              <Text style={styles.sessionDate}>
                {item.startedAt.toLocaleDateString()} · {item.completedAt ? 'Completed' : 'In progress'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.stat}>{item.setCount} sets</Text>
              <Text style={styles.statSecondary}>{Math.round(item.totalVolumeKg)} kg volume</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No workout history yet.</Text>}
      />
      <AppBannerAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0d0d0f' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1e',
    borderRadius: 10,
    marginBottom: 10,
  },
  sessionName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  sessionDate: { color: '#888', fontSize: 13, marginTop: 2 },
  stat: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statSecondary: { color: '#888', fontSize: 12, marginTop: 2 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
});
