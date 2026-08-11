import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/api/client';
import type { ActivityFeedItem } from '@/api/types';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/constants/theme';

export function ActivityFeedScreen() {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/social/feed');
      setItems(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderItem = ({ item }: { item: ActivityFeedItem }) => (
    <Card style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons name="person-circle" size={36} color={theme.colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.detail}>
          {item.workout_name ?? 'Workout'} · {item.set_count} sets
        </Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
      <Text style={styles.time}>{timeAgo(item.performed_at)}</Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Activity Feed</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} color={theme.colors.primary} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No activity yet"
          message="Follow friends to see their workouts here."
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
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
  list: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  detail: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  notes: { color: theme.colors.muted, fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  time: { color: theme.colors.muted, fontSize: 11 },
});
