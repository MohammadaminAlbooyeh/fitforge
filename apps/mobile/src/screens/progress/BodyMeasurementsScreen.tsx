import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/api/client';
import type { BodyMeasurement } from '@/api/types';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/constants/theme';

export function BodyMeasurementsScreen({ navigation }: any) {
  const [data, setData] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/body-measurements');
      setData(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  const renderItem = ({ item }: { item: BodyMeasurement }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.metricsRow}>
        {item.weight_kg != null && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.weight_kg}</Text>
            <Text style={styles.metricLabel}>kg</Text>
          </View>
        )}
        {item.body_fat_pct != null && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.body_fat_pct}%</Text>
            <Text style={styles.metricLabel}>fat</Text>
          </View>
        )}
        {item.chest_cm != null && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.chest_cm}</Text>
            <Text style={styles.metricLabel}>chest</Text>
          </View>
        )}
        {item.waist_cm != null && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.waist_cm}</Text>
            <Text style={styles.metricLabel}>waist</Text>
          </View>
        )}
        {item.arms_cm != null && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.arms_cm}</Text>
            <Text style={styles.metricLabel}>arms</Text>
          </View>
        )}
      </View>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Body Measurements</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddMeasurement')}
        >
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} color={theme.colors.primary} />
      ) : data.length === 0 ? (
        <EmptyState
          icon="body-outline"
          title="No measurements yet"
          message="Track your body measurements to see progress over time."
          action={{ label: 'Add Measurement', onPress: () => navigation.navigate('AddMeasurement') }}
        />
      ) : (
        <FlatList
          data={data}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  list: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: { gap: theme.spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: theme.colors.muted, fontSize: 13 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg },
  metric: { alignItems: 'center' },
  metricValue: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  metricLabel: { color: theme.colors.muted, fontSize: 11 },
  notes: { color: theme.colors.muted, fontSize: 12, fontStyle: 'italic' },
});
