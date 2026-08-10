import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';
import { theme } from '@/constants/theme';

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { workouts } = useWorkouts();
  const firstName = (user?.full_name ?? 'there').split(' ')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi {firstName},</Text>
          <Text style={styles.title}>Get In Shape</Text>
        </View>
        <Avatar name={user?.full_name} size={44} />
      </View>

      <LinearGradient
        colors={theme.gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>Entry Level</Text>
        </View>
        <Text style={styles.bannerTitle}>Shoulder Press</Text>
        <Text style={styles.bannerSubtitle}>16 shoulder workout videos for you</Text>
        <View style={styles.bannerFooter}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={16} color={theme.colors.accent} />
          </View>
          <Text style={styles.bannerSubtitle}>34 Minutes</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Exercises</Text>
        <Text style={styles.link}>View All</Text>
      </View>

      <View style={styles.exerciseRow}>
        {(workouts.length > 0
          ? workouts.slice(0, 2)
          : [
              { id: -1, name: 'Dumbbell rows', exercises: [] },
              { id: -2, name: 'Squat training', exercises: [] },
            ]
        ).map((w) => (
          <Card
            key={w.id}
            style={styles.exerciseCard}
            onPress={() =>
              w.id > 0 ? navigation.getParent()?.navigate('WorkoutDetail', { workoutId: w.id }) : undefined
            }
          >
            <View style={styles.exerciseIcon}>
              <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.exerciseName}>{w.name}</Text>
            <Text style={styles.exerciseMeta}>{w.exercises.length || '—'} workouts</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.lg, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: theme.colors.muted, fontSize: 14 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  banner: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: theme.spacing.sm,
  },
  bannerBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  bannerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  bannerFooter: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  exerciseRow: { flexDirection: 'row', gap: theme.spacing.md },
  exerciseCard: { flex: 1, alignItems: 'flex-start', gap: theme.spacing.xs },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  exerciseMeta: { color: theme.colors.muted, fontSize: 12 },
});
