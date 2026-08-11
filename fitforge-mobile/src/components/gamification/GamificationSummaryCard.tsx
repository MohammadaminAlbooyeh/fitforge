import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/api/client';
import type { GamificationSummary } from '@/api/types';
import { theme } from '@/constants/theme';

type Props = { onPressAchievements?: () => void };

export function GamificationSummaryCard({ onPressAchievements }: Props) {
  const [data, setData] = useState<GamificationSummary | null>(null);

  useEffect(() => {
    api.get('/gamification/summary').then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return null;

  const { xp, achievements, next_level_xp } = data;
  const unlockedCount = achievements.length;
  const progress = next_level_xp > 0 ? xp.total_xp / next_level_xp : 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Ionicons name="trophy" size={18} color={theme.colors.primary} />
          <Text style={styles.levelText}>Level {xp.level}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color="#F59E0B" />
          <Text style={styles.streakText}>{xp.streak_days}d streak</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.xpText}>{xp.total_xp} / {next_level_xp} XP</Text>

      <TouchableOpacity style={styles.achievementsBtn} onPress={onPressAchievements}>
        <Ionicons name="medal-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.achievementsBtnText}>{unlockedCount} Achievements</Text>
        <Ionicons name="chevron-forward" size={14} color={theme.colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { color: '#F59E0B', fontSize: 13, fontWeight: '600' },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: theme.colors.primary },
  xpText: { color: theme.colors.muted, fontSize: 11, textAlign: 'right' },
  achievementsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  achievementsBtnText: { color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
});
