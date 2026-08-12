import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';

export function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <Ionicons name="flash" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.brand}>FitForge</Text>
      </View>

      <View style={styles.tabRow}>
        <Text style={[styles.tab, styles.tabActive]}>Sign In</Text>
        <Text style={styles.tab} onPress={() => navigation.navigate('Signup')}>
          Register
        </Text>
      </View>

      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign In" onPress={handleSubmit} loading={loading} variant="accent" />
      <Button
        title="Create account"
        variant="ghost"
        onPress={() => navigation.navigate('Signup')}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tab: { color: theme.colors.muted, fontSize: 16, fontWeight: '600', paddingBottom: 6 },
  tabActive: {
    color: theme.colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
});
