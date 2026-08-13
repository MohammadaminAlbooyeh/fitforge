import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

const KEYS = {
  darkMode: 'fitforge.settings.darkMode',
  goalShared: 'fitforge.settings.goalShared',
  weeklyDigest: 'fitforge.settings.weeklyDigest',
};

function usePersistedBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    AsyncStorage.getItem(key).then((raw) => {
      if (raw != null) setValue(raw === 'true');
    }).catch(() => {});
  }, [key]);

  const toggle = async (next: boolean) => {
    setValue(next);
    await AsyncStorage.setItem(key, String(next)).catch(() => {});
  };

  return [value, toggle] as const;
}

export function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [darkMode, toggleDarkMode] = usePersistedBoolean(KEYS.darkMode, false);
  const [goalShared, toggleGoalShared] = usePersistedBoolean(KEYS.goalShared, true);
  const [weeklyDigest, toggleWeeklyDigest] = usePersistedBoolean(KEYS.weeklyDigest, true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <Card>
        <View style={styles.accountRow}>
          <Avatar name={user?.full_name} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={styles.accountName}>{user?.full_name}</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
          <Ionicons
            name="create-outline"
            size={20}
            color={theme.colors.primary}
            onPress={() => navigation.navigate('EditProfile')}
          />
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Preferences</Text>
      <Card>
        <SettingToggle icon="moon-outline" label="Dark mode" value={darkMode} onValueChange={toggleDarkMode} />
        <SettingToggle icon="language-outline" label="Language" value={false} onValueChange={() => {}} rightLabel="English" />
      </Card>

      <Text style={styles.sectionLabel}>Notifications</Text>
      <Card>
        <SettingToggle
          icon="calendar-outline"
          label="Weekly digest"
          value={weeklyDigest}
          onValueChange={toggleWeeklyDigest}
        />
        <PressableRow
          icon="notifications-outline"
          label="Notification preferences"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
      </Card>

      <Text style={styles.sectionLabel}>Privacy</Text>
      <Card>
        <SettingToggle
          icon="globe-outline"
          label="Share goals with community"
          value={goalShared}
          onValueChange={toggleGoalShared}
        />
      </Card>

      <PressableCard onPress={() => Alert.alert('FitForge', 'FitForge v0.1.0 — built to help you build.')}>
        <View style={styles.rowBetween}>
          <Text style={styles.aboutText}>About FitForge</Text>
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.muted} />
        </View>
      </PressableCard>

      <PressableCard onPress={logout}>
        <View style={styles.rowBetween}>
          <Text style={styles.logoutText}>Log out</Text>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
        </View>
      </PressableCard>
    </ScrollView>
  );
}

function SettingToggle({
  icon,
  label,
  value,
  onValueChange,
  rightLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  rightLabel?: string;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}

function PressableRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} onPress={onPress} />
    </View>
  );
}

function PressableCard({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <View
      style={[styles.cardPressable, { padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.card }]}
      onTouchEnd={onPress}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  accountName: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  accountEmail: { color: theme.colors.muted, fontSize: 12 },
  sectionLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aboutText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  logoutText: { color: theme.colors.danger, fontSize: 14, fontWeight: '700' },
  cardPressable: { shadowColor: '#3A2E6B', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
});