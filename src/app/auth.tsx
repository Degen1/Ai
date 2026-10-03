import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { login, register, resetPassword } from '@/services/auth-service';

type Mode = 'login' | 'register';

function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';
  if (message === 'AUTH_NOT_CONFIGURED') return 'መእተዊ ኣብዚ ገና ኣይተዳለወን።';
  switch (code) {
    case 'auth/email-already-in-use': return 'እዚ ኢመይል ድሮ ተመዝጊቡ ኣሎ።';
    case 'auth/invalid-email': return 'ቅኑዕ ኢመይል ኣእቱ።';
    case 'auth/weak-password': return 'ዝሓየለ ምስጢራዊ ቃል ምረጽ።';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password': return 'ኢመይል ወይ ምስጢራዊ ቃል ቅኑዕ ኣይኮነን።';
    case 'auth/too-many-requests': return 'ብዙሕ ግዜ ተፈቲኑ። ቍሩብ ጸኒሕካ ፈትን።';
    case 'auth/operation-not-allowed': return 'መእተዊ ሕጂ ኣይተዳለወን። ድሕሪ ግዜ ፈትን።';
    case 'auth/network-request-failed': return 'መርበብካ ፈትሽ እሞ እንደገና ፈትን።';
    default: return 'መእተዊ ኣይተዛዘመን። እንደገና ፈትን።';
  }
}

export default function AuthScreen() {
  const theme = useTheme();
  const { status } = useAuthSession();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const changeMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (busy) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('ኢመይልን ምስጢራዊ ቃልን ኣእቱ።');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('ምስጢራዊ ቃል ብውሑዱ 6 ፊደላት ይኹን።');
      return;
    }
    if (mode === 'register' && password !== confirmation) {
      setError('እቶም ምስጢራዊ ቃላት ኣይሰማምዑን።');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'login') await login(normalizedEmail, password);
      else await register(normalizedEmail, password);
      setPassword('');
      setConfirmation('');
      router.back();
    } catch (nextError) {
      setError(authErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    if (busy) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('መጀመርታ ኢመይልካ ኣእቱ።');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await resetPassword(normalizedEmail);
      setNotice('ናይ ምስጢራዊ ቃል መሕደሲ ኢመይል ተላኢኹ።');
    } catch (nextError) {
      setError(authErrorMessage(nextError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: Spacing.lg, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 420, gap: Spacing.lg, paddingTop: Spacing.lg }}>
          <View style={{ gap: Spacing.sm }}>
            <ThemedText type="subtitle">{mode === 'login' ? 'ናብ ሳራ እቶ' : 'ናይ ሳራ መለለዪ ፍጠር'}</ThemedText>
            <ThemedText type="body" themeColor="textSecondary">
              {mode === 'login' ? 'ብኢመይልካ እቶ።' : 'ኢመይልን ምስጢራዊ ቃልን ተጠቒምካ ተመዝገብ።'}
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', padding: 4, borderRadius: Radius.full, backgroundColor: theme.backgroundElement }}>
            {(['login', 'register'] as const).map((item) => (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: mode === item }}
                onPress={() => changeMode(item)}
                style={{
                  flex: 1,
                  minHeight: 42,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Radius.full,
                  backgroundColor: mode === item ? theme.surface : 'transparent',
                }}>
                <ThemedText type="label">{item === 'login' ? 'Login' : 'Register'}</ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: Spacing.md }}>
            <View style={{ gap: Spacing.sm }}>
              <ThemedText type="label">ኢመይል</ThemedText>
              <TextInput
                accessibilityLabel="ኢመይል"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="name@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                style={{ minHeight: 52, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, color: theme.text, fontSize: 17 }}
              />
            </View>
            <View style={{ gap: Spacing.sm }}>
              <ThemedText type="label">ምስጢራዊ ቃል</ThemedText>
              <TextInput
                accessibilityLabel="ምስጢራዊ ቃል"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                style={{ minHeight: 52, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, color: theme.text, fontSize: 17 }}
              />
            </View>
            {mode === 'register' ? (
              <View style={{ gap: Spacing.sm }}>
                <ThemedText type="label">ምስጢራዊ ቃል ኣረጋግጽ</ThemedText>
                <TextInput
                  accessibilityLabel="ምስጢራዊ ቃል ኣረጋግጽ"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmation}
                  onChangeText={setConfirmation}
                  style={{ minHeight: 52, paddingHorizontal: Spacing.md, borderRadius: Radius.md, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, color: theme.text, fontSize: 17 }}
                />
              </View>
            ) : null}
          </View>

          {error ? <ThemedText type="body" themeColor="danger">{error}</ThemedText> : null}
          {notice ? <ThemedText type="body" themeColor="accent">{notice}</ThemedText> : null}
          {status === 'unavailable' ? (
            <ThemedText type="caption" themeColor="textSecondary">መእተዊ ኣብዚ መሳርሒ ሕጂ ኣይተዳለወን።</ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => { void submit(); }}
            style={({ pressed }) => ({ minHeight: 52, borderRadius: Radius.full, backgroundColor: theme.primaryAction, alignItems: 'center', justifyContent: 'center', opacity: busy || pressed ? 0.7 : 1 })}>
            <ThemedText type="label" style={{ color: theme.primaryActionText }}>
              {busy ? 'በጃኻ ተጸበ…' : mode === 'login' ? 'Login' : 'Register'}
            </ThemedText>
          </Pressable>

          {mode === 'login' ? (
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void sendReset(); }} style={{ alignSelf: 'center', padding: Spacing.sm }}>
              <ThemedText type="label" themeColor="accent">ምስጢራዊ ቃል ረሲዕካዮ?</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
