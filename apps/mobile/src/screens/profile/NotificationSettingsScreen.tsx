import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { sendTestNotification } from '@/api/notifications';
import { theme } from '@/constants/theme';

export function NotificationSettingsScreen() {
  const [workoutName, setWorkoutName] = useState('Leg day');
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    setSending(true);
    try {
      await sendTestNotification(workoutName || 'Workout reminder');
      Alert.alert('Sent', 'A test notification is on its way.');
    } catch (e: any) {
      Alert.alert('Could not send notification', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={28} color={theme.colors.primary} />
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Test how workout reminders will look before you rely on them.
        </Text>
      </View>

      <Card title="Send a test reminder">
        <Text style={styles.cardSubtitle}>Workout name</Text>
        <Input placeholder="e.g. Leg day" value={workoutName} onChangeText={setWorkoutName} />
        <Button title="Send test notification" onPress={handleSendTest} loading={sending} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 60 },
  header: { alignItems: 'center', gap: 4, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: theme.spacing.xs },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center' },
  cardSubtitle: { color: theme.colors.muted, fontSize: 12, marginBottom: -theme.spacing.xs },
});
