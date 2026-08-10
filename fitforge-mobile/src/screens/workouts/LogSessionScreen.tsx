import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { SetLogger } from '@/components/workout/SetLogger';
import { Button } from '@/components/common/Button';
import { theme } from '@/constants/theme';

type LoggedSet = { weight: string; reps: string };

export function LogSessionScreen({ route }: any) {
  const { workoutId } = route.params;
  const [logs, setLogs] = useState<LoggedSet[]>([{ weight: '', reps: '' }]);

  const addSet = () => setLogs((prev) => [...prev, { weight: '', reps: '' }]);

  const saveSession = async () => {
    // TODO: POST /workouts/{workoutId}/sessions with logs
    console.log('saving session for workout', workoutId, logs);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log session</Text>
      {logs.map((log, index) => (
        <SetLogger
          key={index}
          index={index}
          onChange={(field, value) => {
            const next = [...logs];
            next[index] = { ...next[index], [field]: value };
            setLogs(next);
          }}
        />
      ))}
      <Button title="Add set" variant="ghost" onPress={addSet} />
      <Button title="Save session" onPress={saveSession} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold' },
});