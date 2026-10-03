import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { changeAccountPassword, requestAccountEmailChange } from '@/services/auth-service';

type Action = 'email' | 'password' | null;

function accountError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'እቲ ሕጂ ዘሎ ምስጢራዊ ቃል ቅኑዕ ኣይኮነን።';
  if (code === 'auth/email-already-in-use') return 'እዚ ኢመይል ድሮ ተመዝጊቡ ኣሎ።';
  if (code === 'auth/invalid-email') return 'ቅኑዕ ኢመይል ኣእቱ።';
  if (code === 'auth/weak-password') return 'ዝሓየለ ምስጢራዊ ቃል ምረጽ።';
  if (code === 'auth/too-many-requests') return 'ብዙሕ ግዜ ተፈቲኑ ኣሎ። ድሕሪ ቁሩብ ግዜ እንደገና ፈትን።';
  if (code === 'auth/requires-recent-login') return 'መለለዪኻ እንደገና ክትኣቱ ኣለካ።';
  return 'ሓበሬታ መለለዪኻ ክቕየር ኣይከኣለን። እንደገና ፈትን።';
}

export function AccountInformation({ email }: { email: string | null }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<Action>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const chooseAction = (next: Action) => {
    setAction(next === action ? null : next);
    setEmailDraft('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (!action || busy) return;
    setError(null);
    setNotice(null);
    if (!currentPassword) {
      setError('ሕጂ ዘሎ ምስጢራዊ ቃል ኣእቱ።');
      return;
    }
    const nextEmail = emailDraft.trim().toLowerCase();
    if (action === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) || nextEmail === email?.toLowerCase())) {
      setError('ሓድሽን ቅኑዕን ኢመይል ኣእቱ።');
      return;
    }
    if (action === 'password' && (newPassword.length < 6 || newPassword !== confirmation)) {
      setError(newPassword.length < 6 ? 'ምስጢራዊ ቃል እንተወሓደ 6 ፊደላት ክህልዎ ኣለዎ።' : 'እቶም ሓደስቲ ምስጢራዊ ቃላት ኣይሰማምዑን።');
      return;
    }

    setBusy(true);
    try {
      if (action === 'email') {
        await requestAccountEmailChange(nextEmail, currentPassword);
        setNotice('ናብቲ ሓድሽ ኢመይል መረጋገጺ ተላኢኹ። ኢመይልካ ምስ ኣረጋገጽካዮ ይቕየር።');
      } else {
        await changeAccountPassword(newPassword, currentPassword);
        setNotice('ምስጢራዊ ቃልካ ተቐይሩ ኣሎ።');
      }
      setAction(null);
      setEmailDraft('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (nextError) {
      setError(accountError(nextError));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    minHeight: 44,
    paddingHorizontal: Spacing.twoHalf,
    borderRadius: Radius.sm,
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    fontSize: 15,
  } as const;

  return (
    <View style={{ borderRadius: Radius.lg, backgroundColor: theme.surface, overflow: 'hidden' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => { setExpanded(!expanded); if (expanded) chooseAction(null); }}
        style={{ minHeight: 58, paddingHorizontal: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText type="label">ሓበሬታ መለለዪ</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>{email ?? '—'}</ThemedText>
        </View>
        <SymbolView name={{ ios: expanded ? 'chevron.up' : 'chevron.down', android: expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down', web: expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }} size={18} tintColor={theme.textSecondary} />
      </Pressable>
      {expanded ? (
        <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.twoHalf }}>
          <View style={{ height: 1, backgroundColor: theme.border }} />
          <View style={{ gap: Spacing.sm, alignItems: 'flex-start' }}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => chooseAction('email')} style={{ paddingVertical: Spacing.two, paddingHorizontal: Spacing.twoHalf, borderRadius: Radius.full, backgroundColor: action === 'email' ? theme.backgroundSelected : theme.backgroundElement }}>
              <ThemedText type="label">ኢመይል ቀይር</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => chooseAction('password')} style={{ paddingVertical: Spacing.two, paddingHorizontal: Spacing.twoHalf, borderRadius: Radius.full, backgroundColor: action === 'password' ? theme.backgroundSelected : theme.backgroundElement }}>
              <ThemedText type="label">ምስጢራዊ ቃል ቀይር</ThemedText>
            </Pressable>
          </View>
          {action ? (
            <View style={{ gap: Spacing.sm }}>
              {action === 'email' ? (
                <TextInput
                  accessibilityLabel="ሓድሽ ኢመይል"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmailDraft}
                  placeholder="ሓድሽ ኢመይል"
                  placeholderTextColor={theme.textSecondary}
                  value={emailDraft}
                  style={inputStyle}
                />
              ) : null}
              <TextInput
                accessibilityLabel="ሕጂ ዘሎ ምስጢራዊ ቃል"
                autoComplete="current-password"
                onChangeText={setCurrentPassword}
                placeholder="ሕጂ ዘሎ ምስጢራዊ ቃል"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={currentPassword}
                style={inputStyle}
              />
              {action === 'password' ? (
                <>
                  <TextInput
                    accessibilityLabel="ሓድሽ ምስጢራዊ ቃል"
                    autoComplete="new-password"
                    onChangeText={setNewPassword}
                    placeholder="ሓድሽ ምስጢራዊ ቃል"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry
                    value={newPassword}
                    style={inputStyle}
                  />
                  <TextInput
                    accessibilityLabel="ሓድሽ ምስጢራዊ ቃል ኣረጋግጽ"
                    autoComplete="new-password"
                    onChangeText={setConfirmation}
                    placeholder="ሓድሽ ምስጢራዊ ቃል ኣረጋግጽ"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry
                    value={confirmation}
                    style={inputStyle}
                  />
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => { void submit(); }}
                style={({ pressed }) => ({ alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: Spacing.md, justifyContent: 'center', borderRadius: Radius.full, backgroundColor: theme.primaryAction, opacity: pressed || busy ? 0.65 : 1 })}>
                <ThemedText type="label" style={{ color: theme.primaryActionText }}>{busy ? '…' : 'ዓቅብ'}</ThemedText>
              </Pressable>
            </View>
          ) : null}
          {error ? <ThemedText type="caption" themeColor="danger">{error}</ThemedText> : null}
          {notice ? <ThemedText type="caption" themeColor="textSecondary">{notice}</ThemedText> : null}
        </View>
      ) : null}
    </View>
  );
}
