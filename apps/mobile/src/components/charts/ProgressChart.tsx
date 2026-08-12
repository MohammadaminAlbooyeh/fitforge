import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { api } from '@/api/client';
import type { BodyTrend } from '@/api/types';
import { theme } from '@/constants/theme';

export function ProgressChart() {
  const [data, setData] = useState<BodyTrend[]>([]);

  useEffect(() => {
    api.get('/analytics/enhanced')
      .then((r) => setData(r.data.body_trend ?? []))
      .catch(() => {});
  }, []);

  if (data.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weight (kg)</Text>
        <Text style={styles.empty}>Add body measurements to see your weight trend.</Text>
      </View>
    );
  }

  const labels = data.slice(-6).map((d) => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const weights = data.slice(-6).map((d) => d.weight_kg ?? 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Trend (kg)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: weights }],
        }}
        width={Dimensions.get('window').width - theme.spacing.md * 2}
        height={200}
        chartConfig={{
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          color: (opacity = 1) => `rgba(124, 92, 252, ${opacity})`,
          labelColor: () => theme.colors.muted,
          decimalPlaces: 1,
          propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
        }}
        bezier
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  empty: { color: theme.colors.muted, fontSize: 13, paddingVertical: theme.spacing.md },
});
