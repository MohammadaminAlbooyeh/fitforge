import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { theme } from '@/constants/theme';

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { entitlements, isPro, loading } = useSubscription();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={user?.full_name} size={72} />
        <Text style={styles.name}>{user?.full_name ?? 'Profile'}</Text>
        <Text style={styles.handle}>{user?.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Weight" value={user?.weight_kg ? `${user.weight_kg} kg` : '—'} />
        <Stat label="Height" value={user?.height_cm ? `${user.height_cm} cm` : '—'} />
        <Stat label="Goal" value={user?.goal ?? '—'} />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Subscription</Text>
          <View style={[styles.badge, isPro && styles.badgePro]}>
            <Text style={[styles.badgeText, isPro && styles.badgeTextPro]}>
              {loading ? '…' : entitlements?.plan ?? 'FREE'}
            </Text>
          </View>
        </View>
        <Button
          title={isPro ? 'Manage subscription' : 'Upgrade to Pro'}
          variant="ghost"
          onPress={() =>
            isPro ? navigation.navigate('ManageSubscription') : navigation.getParent()?.navigate('Paywall')
          }
        />
      </Card>

      <Card>
        <MenuRow icon="person-outline" label="Edit profile" />
        <MenuRow
          icon="notifications-outline"
          label="Notifications"
          onPress={() => navigation.getParent()?.navigate('NotificationSettings')}
        />
        <MenuRow icon="shield-checkmark-outline" label="Privacy" />
      </Card>

      <Button title="Log out" variant="accent" onPress={logout} />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 120 },
  header: { alignItems: 'center', gap: 4, marginBottom: theme.spacing.sm },
  name: { color: theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: theme.spacing.sm },
  handle: { color: theme.colors.muted, fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  statItem: { alignItems: 'center', gap: 2, flex: 1 },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: theme.colors.muted, fontSize: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  badge: { backgroundColor: theme.colors.border, borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgePro: { backgroundColor: '#F0EBFF' },
  badgeText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  badgeTextPro: { color: theme.colors.primary },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600' },
});
