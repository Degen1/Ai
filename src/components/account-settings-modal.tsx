import { BottomSheet, Host, RNHostView } from '@expo/ui';
import * as Linking from 'expo-linking';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AccountInformation } from '@/components/account-information';
import { AdaptiveGlass } from '@/components/adaptive-glass';
import { PrivacyPolicyContent } from '@/components/privacy-policy-content';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { TERMS_OF_USE_URL } from '@/constants/legal';
import { SUPPORT_EMAIL } from '@/constants/privacy-policy';
import { ControlSize, ProfileCardMaxWidth, Radius, Spacing } from '@/constants/theme';
import { clearAccountProfile } from '@/data/profile-settings';
import { useAds } from '@/hooks/use-ads';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { deleteAccount, logout } from '@/services/auth-service';

const tabs = [{ id: 'general', label: 'ሓፈሻዊ' }, { id: 'account', label: 'መለለዪ' }] as const;
type SettingsTab = typeof tabs[number]['id'];

export function AccountSettingsModal({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const colorScheme = useAppColorScheme();
  const { height } = useWindowDimensions();
  const { user } = useAuthSession();
  const ads = useAds();
  const [tab, setTab] = useState<SettingsTab>('general');
  const [showPolicy, setShowPolicy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const activeTab = user ? tab : 'general';

  const run = async (action: () => Promise<void>, failure: string | ((cause: unknown) => string)) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(typeof failure === 'string' ? failure : failure(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const openLink = (url: string) => {
    void run(async () => { await Linking.openURL(url); }, 'እቲ መላግቦ ክኽፈት ኣይከኣለን።');
  };

  const confirmDelete = () => {
    if (!user || lock.current) return;
    const uid = user.uid;
    const remove = () => {
      void run(async () => {
        await deleteAccount();
        clearAccountProfile(uid);
        setTab('general');
      }, (cause) => {
        const code = cause && typeof cause === 'object' && 'code' in cause ? cause.code : '';
        return code === 'auth/requires-recent-login'
          ? 'መለለዪኻ ንምስራዝ ቀዳማይ ውጻእ እሞ እንደገና እቶ።'
          : 'መለለዪኻ ክስረዝ ኣይከኣለን። እንደገና ፈትን።';
      });
    };
    const confirmation = 'መለለዪኻ ብቐዋምነት ክስረዝ ትደሊ?';
    if (Platform.OS === 'web') {
      if (window.confirm(confirmation)) remove();
      return;
    }
    Alert.alert('መለለዪ ሰርዝ', confirmation, [
      { text: 'ይቕረ', style: 'cancel' },
      { text: 'ሰርዝ', style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <Host colorScheme={colorScheme} style={{ position: 'absolute' }}>
      <BottomSheet
        isPresented
        onDismiss={onClose}
        snapPoints={['full']}
        showDragIndicator={false}
        contentPadding={0}
        containerColor={theme.background}
        shouldDismissOnBackPress={!busy}
        shouldDismissOnClickOutside={!busy}>
        <RNHostView style={Platform.OS === 'web' ? { height: height * 0.96 } : undefined}>
          <View style={styles.sheetBody}>
            <View style={styles.content}>
              {showPolicy ? (
                <View style={styles.policyHeader}>
                  <SymbolButton
                    accessibilityLabel="ናብ ቅጥዕታት ተመለስ"
                    glass
                    name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                    onPress={() => setShowPolicy(false)}
                  />
                  <ThemedText accessibilityRole="header" type="headline" style={styles.title}>
                    ፖሊሲ ብሕትውና
                  </ThemedText>
                  <View style={styles.policyHeaderSpacer} />
                </View>
              ) : null}
              {!showPolicy && user ? (
                <AdaptiveGlass strong style={{ flexDirection: 'row', gap: Spacing.xs, padding: Spacing.xs, borderRadius: Radius.full }}>
                  {tabs.map(({ id, label }) => (
                    <Pressable
                      key={id}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activeTab === id, disabled: busy }}
                      disabled={busy}
                      onPress={() => { setTab(id); setError(null); }}
                      style={({ pressed }) => ({
                        flex: 1, minHeight: ControlSize.touch, paddingHorizontal: Spacing.sm,
                        alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full,
                        backgroundColor: activeTab === id ? theme.backgroundSelected : 'transparent',
                        opacity: pressed ? 0.65 : 1,
                      })}>
                      <ThemedText type="label">{label}</ThemedText>
                    </Pressable>
                  ))}
                </AdaptiveGlass>
              ) : null}
              <ScrollView
                key={showPolicy ? 'policy' : activeTab}
                automaticallyAdjustKeyboardInsets
                contentInsetAdjustmentBehavior="never"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: Spacing.md, paddingBottom: Spacing.lg }}>
                {error ? <ThemedText type="caption" themeColor="danger" accessibilityRole="alert">{error}</ThemedText> : null}
                {showPolicy ? <PrivacyPolicyContent /> : activeTab === 'account' && user ? (
                  <AccountInformation key={user.uid} email={user.email} />
                ) : (
                  <View style={styles.settingsList}>
                    <SettingsRow
                      label="ፖሊሲ ብሕትውና"
                      icon={{ ios: 'hand.raised', android: 'privacy_tip', web: 'privacy_tip' }}
                      disabled={busy}
                      onPress={() => setShowPolicy(true)}
                    />
                    <SettingsRow
                      label="ናይ ኣጠቓቕማ ውዕል"
                      icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
                      disabled={busy}
                      onPress={() => openLink(TERMS_OF_USE_URL)}
                      link
                    />
                    <SettingsRow
                      label="ሓገዝ"
                      icon={{ ios: 'envelope', android: 'mail_outline', web: 'mail_outline' }}
                      disabled={busy}
                      onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}
                      link
                    />
                    {ads.privacyRequired ? (
                      <SettingsRow
                        label="ምርጫታት ብሕትውና ማስታወቂያ"
                        icon={{ ios: 'shield', android: 'shield', web: 'shield' }}
                        disabled={busy}
                        onPress={() => {
                          void run(async () => {
                            if (!await ads.showPrivacyOptions()) throw new Error('AD_PRIVACY_UNAVAILABLE');
                          }, 'ምርጫታት ብሕትውና ክኽፈታ ኣይከኣላን።');
                        }}
                      />
                    ) : null}
                  </View>
                )}
              </ScrollView>
              {!showPolicy && user ? (
                activeTab === 'general' ? (
                  <SettingsAction
                    label="ውጻእ"
                    icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
                    disabled={busy}
                    onPress={() => { void run(logout, 'ካብ መለለዪኻ ምውጻእ ኣይከኣለን።'); }}
                  />
                ) : (
                  <SettingsAction
                    label="መለለዪ ሰርዝ"
                    icon={{ ios: 'trash', android: 'delete_outline', web: 'delete_outline' }}
                    destructive
                    disabled={busy}
                    onPress={confirmDelete}
                  />
                )
              ) : null}
            </View>
          </View>
        </RNHostView>
      </BottomSheet>
    </Host>
  );
}

type SettingsButtonProps = {
  label: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
  disabled: boolean;
};

function SettingsAction({ label, icon, onPress, disabled, destructive }: SettingsButtonProps & { destructive?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: ControlSize.field,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        backgroundColor: destructive ? '#B93232' : '#0064D1',
        opacity: pressed || disabled ? 0.65 : 1,
      })}>
      <SymbolView name={icon} size={20} tintColor="#FFFFFF" />
      <ThemedText type="label" style={{ color: '#FFFFFF', flexShrink: 1, textAlign: 'center' }}>{label}</ThemedText>
    </Pressable>
  );
}

function SettingsRow({ label, icon, onPress, disabled, link }: SettingsButtonProps & { link?: boolean }) {
  const theme = useTheme();
  return (
    <AdaptiveGlass
      strong
      shape="roundedRectangle"
      cornerRadius={Radius.md}
      style={[styles.section, { borderColor: theme.glassBorder }]}>
      <Pressable
        accessibilityRole={link ? 'link' : 'button'}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.row, (pressed || disabled) && styles.dimmed]}>
        <SymbolView name={icon} size={19} tintColor={theme.textSecondary} />
        <ThemedText type="label" style={styles.rowLabel}>{label}</ThemedText>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={theme.textSecondary} />
      </Pressable>
    </AdaptiveGlass>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: ProfileCardMaxWidth,
    gap: Spacing.md,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  policyHeaderSpacer: {
    width: ControlSize.field,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  settingsList: {
    gap: Spacing.twoHalf,
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: ControlSize.field,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowLabel: {
    flex: 1,
  },
  dimmed: {
    opacity: 0.6,
  },
});
