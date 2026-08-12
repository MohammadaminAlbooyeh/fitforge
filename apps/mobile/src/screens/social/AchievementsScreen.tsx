import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Achievement } from '@/api/types';
import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';

export function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/gamification/summary');
      setAchievements(res.data.achievements ?? []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: Achievement }) => (
    <Card style={styles.card}>
      <Text style={styles.icon}>{item.icon}</Text>
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.earnedAt}>Earned {new Date(item.earned_at).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.xp}>+{item.xp_earned} XP</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Achievements</Text>
        <Text style={styles.subtitle}>{achievements.length} unlocked</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} color={theme.colors.primary} />
      ) : (
        <FlatList
          data={achievements}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: theme.spacing.md },
  heading: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 13, marginTop: 2 },
  list: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  title: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  desc: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  earnedAt: { color: theme.colors.primary, fontSize: 11, marginTop: 2 },
  xp: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
});
