import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  seconds: number;
  onDone: () => void;
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RestTimer({ seconds, onDone }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onDoneRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rest</Text>
      <Text style={styles.time}>{formatTime(remaining)}</Text>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => setRemaining((r) => Math.max(0, r - 15))}>
          <Text style={styles.buttonText}>-15s</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => setRemaining((r) => r + 15)}>
          <Text style={styles.buttonText}>+15s</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.skip]} onPress={() => setRemaining(0)}>
          <Text style={[styles.buttonText, styles.skipText]}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  label: { color: '#FFFFFF', opacity: 0.8, fontSize: 13, fontWeight: '600' },
  time: { color: '#FFFFFF', fontSize: 36, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  skip: { backgroundColor: theme.colors.accent },
  skipText: { color: '#FFFFFF' },
});
