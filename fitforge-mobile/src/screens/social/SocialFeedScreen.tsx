import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/api/client';
import type { LeaderboardEntry, Challenge, UserPublicProfile, ActivityFeedItem } from '@/api/types';
import { Card } from '@/components/common/Card';
import { theme } from '@/constants/theme';

type Tab = 'feed' | 'leaderboard' | 'challenges' | 'search';

export function SocialFeedScreen() {
  const [tab, setTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [searchResults, setSearchResults] = useState<UserPublicProfile[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/social/feed');
      setFeed(res.data);
    } catch {} finally { setLoading(false); }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/social/leaderboard');
      setLeaderboard(res.data);
    } catch {} finally { setLoading(false); }
  }, []);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/social/challenges');
      setChallenges(res.data);
    } catch {} finally { setLoading(false); }
  }, []);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/social/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data);
    } catch {} finally { setLoading(false); }
  }, [query]);

  useEffect(() => {
    if (tab === 'feed') loadFeed();
    else if (tab === 'leaderboard') loadLeaderboard();
    else if (tab === 'challenges') loadChallenges();
  }, [tab, loadFeed, loadLeaderboard, loadChallenges]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderFeedItem = ({ item }: { item: ActivityFeedItem }) => (
    <Card style={styles.feedCard}>
      <View style={styles.feedAvatar}>
        <Ionicons name="person-circle" size={36} color={theme.colors.primary} />
      </View>
      <View style={styles.feedInfo}>
        <Text style={styles.feedName}>{item.full_name}</Text>
        <Text style={styles.feedDetail}>
          {item.workout_name ?? 'Workout'} · {item.set_count} sets
        </Text>
        {item.notes ? <Text style={styles.feedNotes}>{item.notes}</Text> : null}
      </View>
      <Text style={styles.feedTime}>{timeAgo(item.performed_at)}</Text>
    </Card>
  );

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <Card style={styles.lbCard}>
      <Text style={styles.lbRank}>#{index + 1}</Text>
      <View style={styles.lbInfo}>
        <Text style={styles.lbName}>{item.full_name}</Text>
        <Text style={styles.lbMeta}>Level {item.level} · {item.streak_days}d streak</Text>
      </View>
      <Text style={styles.lbXp}>{item.xp} XP</Text>
    </Card>
  );

  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <Card style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{item.title}</Text>
      {item.description ? <Text style={styles.challengeDesc}>{item.description}</Text> : null}
      <Text style={styles.challengeMeta}>
        {item.goal_count} workouts · {item.challenge_type}
      </Text>
      <Text style={styles.challengeDate}>
        {item.start_date} — {item.end_date}
      </Text>
    </Card>
  );

  const renderSearchItem = ({ item }: { item: UserPublicProfile }) => (
    <Card style={styles.searchCard}>
      <View style={styles.searchInfo}>
        <Text style={styles.searchName}>{item.full_name}</Text>
        <Text style={styles.searchMeta}>Level {item.level} · {item.streak_days}d streak</Text>
      </View>
      <TouchableOpacity
        style={styles.followBtn}
        onPress={() => api.post('/social/follow', { user_id: item.user_id }).then(() => {})}
      >
        <Ionicons name={item.is_following ? 'checkmark-circle' : 'person-add-outline'} size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>Social</Text>

      <View style={styles.tabs}>
        {(['feed', 'leaderboard', 'challenges', 'search'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'search' && (
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={search}>
            <Ionicons name="search" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.center} color={theme.colors.primary} />
      ) : tab === 'feed' ? (
        <FlatList
          data={feed}
          renderItem={renderFeedItem}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
        />
      ) : tab === 'leaderboard' ? (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => String(item.user_id)}
          contentContainerStyle={styles.list}
        />
      ) : tab === 'challenges' ? (
        <FlatList
          data={challenges}
          renderItem={renderChallengeItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => String(item.user_id)}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { color: theme.colors.text, fontSize: 24, fontWeight: '800', padding: theme.spacing.md },
  tabs: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: theme.radius.pill },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  list: { padding: theme.spacing.md, gap: theme.spacing.md },
  feedCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  feedAvatar: { width: 40, alignItems: 'center' },
  feedInfo: { flex: 1 },
  feedName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  feedDetail: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  feedNotes: { color: theme.colors.muted, fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  feedTime: { color: theme.colors.muted, fontSize: 11 },
  lbCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  lbRank: { color: theme.colors.primary, fontSize: 16, fontWeight: '800', width: 36 },
  lbInfo: { flex: 1 },
  lbName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  lbMeta: { color: theme.colors.muted, fontSize: 12 },
  lbXp: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  challengeCard: { gap: theme.spacing.xs },
  challengeTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  challengeDesc: { color: theme.colors.muted, fontSize: 12 },
  challengeMeta: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  challengeDate: { color: theme.colors.muted, fontSize: 11 },
  searchRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.text,
    fontSize: 14,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  searchInfo: { flex: 1 },
  searchName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  searchMeta: { color: theme.colors.muted, fontSize: 12 },
  followBtn: { padding: 4 },
});
