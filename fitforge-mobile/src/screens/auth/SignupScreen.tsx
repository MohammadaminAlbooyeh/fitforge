import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.title}>Create account</Text>
      <Input placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign up" onPress={handleSubmit} loading={loading} />
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
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  error: {
    color: theme.colors.danger,
    textAlign: 'center',
  },
});