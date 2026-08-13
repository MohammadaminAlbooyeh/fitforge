import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useHomeFeed } from '@/hooks/useHomeFeed';
import { HeroSection } from '@/components/home/HeroSection';
import { TodaySummaryCard } from '@/components/home/TodaySummaryCard';
import { ContinueSection } from '@/components/home/ContinueSection';
import { GoalsCard } from '@/components/home/GoalsCard';
import { RecommendedNextStep } from '@/components/home/RecommendedNextStep';
import { InsightsCard } from '@/components/home/InsightsCard';
import { RemindersCard } from '@/components/home/RemindersCard';
import { CommunityCard } from '@/components/home/CommunityCard';
import { theme } from '@/constants/theme';

export function HomeScreen({ navigation }: any) {
  const {
    user,
    plan,
    nutrition,
    meals,
    logs,
    analytics,
    enhanced,
    challenges,
    leaderboard,
    steps,
    loading,
  } = useHomeFeed();

  const firstName = (user?.full_name ?? 'there').split(' ')[0];

  const goDailyPlan = () => navigation.getParent()?.navigate('DailyPlan');
  const goWorkouts = () => navigation.getParent()?.navigate('Workouts');
  const goNutrition = () => navigation.navigate('Nutrition');
  const goCommunity = () => navigation.getParent()?.navigate('SocialFeed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HeroSection
        firstName={firstName}
        goal={user?.goal}
        streakDays={enhanced?.streak_days}
        ctaLabel={plan && !plan.rest ? 'Start today’s workout' : 'Explore workouts'}
        onPrimaryCTA={plan && !plan.rest ? goDailyPlan : goWorkouts}
      />

      <RecommendedNextStep
        plan={plan}
        logs={logs}
        meals={meals}
        onPlan={goDailyPlan}
        onMeal={goNutrition}
        onWorkout={goWorkouts}
      />

      <TodaySummaryCard nutrition={nutrition} logs={logs} steps={steps} />

      <ContinueSection
        plan={plan}
        logs={logs}
        meals={meals}
        onPlan={goDailyPlan}
        onWorkout={goWorkouts}
        onMeal={goNutrition}
      />

      <GoalsCard user={user} enhanced={enhanced} />

      {!loading && (
        <RemindersCard
          plan={plan}
          logs={logs}
          meals={meals}
        />
      )}

      <InsightsCard enhanced={enhanced} logs={logs} weeklyTarget={user?.available_days_per_week ?? null} />

      <CommunityCard challenges={challenges} leaderboard={leaderboard} onOpen={goCommunity} />

      {analytics && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {analytics.total_sessions} sessions · {analytics.total_sets} sets logged all-time
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.lg, paddingBottom: 120 },
  footer: { alignItems: 'center' },
  footerText: { color: theme.colors.muted, fontSize: 12 },
});