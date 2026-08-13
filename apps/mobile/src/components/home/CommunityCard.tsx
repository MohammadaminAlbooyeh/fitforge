import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';
import type { Challenge, LeaderboardEntry } from '@/api/types';

type Props = {
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  onOpen: () => void;
};

function topThree(leaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
  return leaderboard.slice(0, 3);
}

function activeChallenge(challenges: Challenge[]): Challenge | null {
  if (challenges.length === 0) return null;
  const now = new Date();
  const active = challenges.filter(
    (c) => new Date(c.start_date) <= now && new Date(c.end_date) >= now
  );
  return (active[0] ?? challenges[0]) || null;
}

export function CommunityCard({ challenges, leaderboard, onOpen }: Props) {
  const challenge = activeChallenge(challenges);
  const top = topThree(leaderboard);

  if (!challenge && top.length === 0) return null;

  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.9}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
        </View>

        {challenge ? (
          <View style={styles.section}>
            <View style={styles.iconBadge}>
              <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
            </View>
            <View style={styles.sectionText}>
              <Text style={styles.sectionLabel}>Challenge</Text>
              <Text style={styles.sectionValue} numberOfLines={1}>{challenge.title}</Text>
            </View>
          </View>
        ) : null}

        {top.length > 0 ? (
          <View style={styles.leaderboard}>
            {top.map((e, i) => (
              <View key={e.user_id} style={styles.lbRow}>
                <View style={[styles.rankCircle, i === 0 && styles.rankGold]}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <Text style={styles.lbName} numberOfLines={1}>{e.full_name}</Text>
                <Text style={styles.lbXp}>{e.xp} XP</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  section: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF4E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: { flex: 1, gap: 2 },
  sectionLabel: { color: theme.colors.muted, fontSize: 11 },
  sectionValue: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  leaderboard: { gap: theme.spacing.sm, marginTop: theme.spacing.md },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  rankCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: { backgroundColor: '#FDE68A' },
  rankText: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  lbName: { color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  lbXp: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
});