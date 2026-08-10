import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';

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
      <Text style={styles.title}>FitForge</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Log in" onPress={handleSubmit} loading={loading} />
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
  title: {
    color: theme.colors.primary,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
});