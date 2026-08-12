import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/constants/theme';
import { validateEmail, validatePassword } from '@/utils/validators';

export function SignupScreen({ navigation }: any) {
  const { signup, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await signup(fullName, email, password);
    } catch (e: any) {
      setError(e.message ?? 'Signup failed');
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
        <Text style={styles.tab} onPress={() => navigation.goBack()}>
          Sign In
        </Text>
        <Text style={[styles.tab, styles.tabActive]}>Register</Text>
      </View>

      <Input placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <Input
        placeholder="Email Address (e.g. john@domain.com)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password (One special number must)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign Up" onPress={handleSubmit} loading={loading} variant="accent" />
      <Button title="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
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
