import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { api } from '@/api/client';
import type { WeeklyVolume } from '@/api/types';
import { theme } from '@/constants/theme';

export function WeeklyVolumeChart() {
  const [data, setData] = useState<WeeklyVolume[]>([]);

  useEffect(() => {
    api.get('/analytics/enhanced')
      .then((r) => setData(r.data.weekly_volume ?? []))
      .catch(() => {});
  }, []);

  if (data.length === 0) {
    return null;
  }

  const recent = data.slice(-6);
  const labels = recent.map((d) => {
    const date = new Date(d.week_start);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const workouts = recent.map((d) => d.workouts);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Workouts</Text>
      <BarChart
        data={{
          labels,
          datasets: [{ data: workouts }],
        }}
        width={Dimensions.get('window').width - theme.spacing.md * 2}
        height={180}
        chartConfig={{
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          color: (opacity = 1) => `rgba(124, 92, 252, ${opacity})`,
          labelColor: () => theme.colors.muted,
          decimalPlaces: 0,
          barPercentage: 0.6,
        }}
        fromZero
        yAxisSuffix=""
        yAxisLabel=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
});
