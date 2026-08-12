import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useWorkouts } from '@/hooks/useWorkouts';
import { theme } from '@/constants/theme';
import { Workout } from '@/api/types';

export function WorkoutListScreen({ navigation }: any) {
  const { workouts, loading, refresh } = useWorkouts();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Workouts</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        onRefresh={refresh}
        refreshing={loading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading ? 'Loading...' : 'No workouts yet. Create your first one!'}
          </Text>
        }
        renderItem={({ item }: { item: Workout }) => (
          <Card
            title={item.name}
            subtitle={`${item.exercises.length} exercise(s)`}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
      />
      <Button
        title="Today's plan"
        variant="ghost"
        onPress={() => navigation.getParent()?.navigate('DailyPlan')}
      />
      <Button
        title="New workout"
        onPress={() => navigation.getParent()?.navigate('WorkoutEditor')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800' },
  list: { paddingBottom: theme.spacing.md },
  empty: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
