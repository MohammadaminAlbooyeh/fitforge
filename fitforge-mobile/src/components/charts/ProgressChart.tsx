import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { theme } from '@/constants/theme';

export function ProgressChart() {
  const data = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
    datasets: [{ data: [78, 77, 76.5, 76, 75.5] }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight (kg)</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - theme.spacing.md * 2}
        height={220}
        chartConfig={{
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          color: (opacity = 1) => `rgba(124, 92, 252, ${opacity})`,
          labelColor: () => theme.colors.muted,
          decimalPlaces: 1,
        }}
        bezier
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '600' },
});