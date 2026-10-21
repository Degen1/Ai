import { useAds } from '@/hooks/use-ads';
import { AdBanner } from '@/components/ad-banner';
import { router } from 'expo-router';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountInformation } from '@/components/account-information';
import { ProfileAvatar } from '@/components/profile-avatar';
import { ThemedText } from '@/components/themed-text';
import { ControlSize, FormInputStyle, MembershipCard, ProfileCardMaxWidth, Radius, Spacing } from '@/constants/theme';
import { TERMS_OF_USE_URL } from '@/constants/legal';
import { SUPPORT_EMAIL } from '@/constants/privacy-policy';
import { clearAccountProfile, removeProfileAvatar, saveProfileAvatar, setProfileDisplayName, useAccountProfile } from '@/data/profile-settings';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { deleteAccount, logout, updateAccountName } from '@/services/auth-service';
import { getGoldStatus, subscribeGoldStatus } from '@/services/gold-subscription';

type ProfileDrawerProps = {
  adsVisible?: boolean;
  onClose: () => void;
  progress: SharedValue<number>;
  width: number;
};

type PendingAvatar = { uri: string; base64: string };

export function ProfileDrawer({ adsVisible = true, onClose, progress, width }: ProfileDrawerProps) {
  const ads = useAds();
  const insets = useSafeAreaInsets();
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const { status, user } = useAuthSession();
  const { avatar, displayName } = useAccountProfile(user?.uid ?? null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [pendingAvatar, setPendingAvatar] = useState<PendingAvatar | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gold, setGold] = useState(false);
  const cardWidth = Math.min(width - Spacing.md * 2, ProfileCardMaxWidth);
  let glassAvailable = false;
  if (Platform.OS === 'ios') {
    try {
      glassAvailable = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
    } catch {
      // Older development builds may not contain the native glass module.
    }
  }
  const ProfileCard = glassAvailable ? GlassView : View;
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 + progress.get()) * width }],
  }));

  useEffect(() => {
    let current = true;
    const unsubscribe = subscribeGoldStatus((active) => { if (current) setGold(active); });
    void getGoldStatus()
      .then((active) => { if (current) setGold(active); })
      .catch(() => { if (current) setGold(false); });
    return () => { current = false; unsubscribe(); };
  }, [user?.uid]);

  const cancelEditing = () => {
    setEditing(false);
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setError(null);
  };

  const openModal = (path: '/auth' | '/gold' | '/privacy') => {
    cancelEditing();
    if (path !== '/gold') onClose();
    router.push(path);
  };

  const startEditing = () => {
    if (!user) return;
    setNameDraft(displayName ?? user.displayName ?? '');
    setPendingAvatar(null);
    setRemoveAvatar(false);
    setError(null);
    setEditing(true);
  };

  const pickAvatar = async () => {
    if (!editing || !user || pickingPhoto || busy) return;
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset || !asset.width || !asset.height) throw new Error('AVATAR_EMPTY');
      const edge = Math.min(asset.width, asset.height);
      const image = await ImageManipulator.manipulate(asset.uri)
        .crop({
          originX: Math.floor((asset.width - edge) / 2),
          originY: Math.floor((asset.height - edge) / 2),
          width: edge,
          height: edge,
        })
        .resize({ width: 512, height: 512 })
        .renderAsync();
      const saved = await image.saveAsync({
        base64: true,
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      if (!saved.base64) throw new Error('AVATAR_EMPTY');
      setPendingAvatar({ uri: saved.uri, base64: saved.base64 });
      setRemoveAvatar(false);
      setError(null);
    } catch {
      setError('ስእሊ መገለጺ ክምረጽ ኣይከኣለን። እንደገና ፈትን።');
    } finally {
      setPickingPhoto(false);
    }
  };

  const saveProfile = async () => {
    if (!user || busy || pickingPhoto) return;
    setBusy(true);
    setError(null);
    try {
      const nextName = nameDraft.trim().slice(0, 40);
      const currentName = displayName ?? user.displayName ?? '';
      if (nextName !== currentName) await updateAccountName(nextName);
      if (removeAvatar) removeProfileAvatar(user.uid);
      else if (pendingAvatar) saveProfileAvatar(user.uid, pendingAvatar.base64);
      if (nextName !== displayName) setProfileDisplayName(user.uid, nextName);
      setPendingAvatar(null);
      setRemoveAvatar(false);
      setEditing(false);
    } catch {
      setError('መገለጺኻ ክቕመጥ ኣይከኣለን። እንደገና ፈትን።');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await logout();
      cancelEditing();
    } catch {
      setError('ካብ መለለዪኻ ምውጻእ ኣይከኣለን።');
    } finally {
      setBusy(false);
    }
  };

  const removeAccount = async () => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      clearAccountProfile(user.uid);
      cancelEditing();
    } catch (nextError) {
      const code = nextError && typeof nextError === 'object' && 'code' in nextError ? String(nextError.code) : '';
      setError(code === 'auth/requires-recent-login'
        ? 'መለለዪኻ ንምስራዝ ቀዳማይ ውጻእ እሞ እንደገና እቶ።'
        : 'መለለዪኻ ክስረዝ ኣይከኣለን። እንደገና ፈትን።');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('መለለዪኻ ብቐዋምነት ክስረዝ ትደሊ?')) void removeAccount();
      return;
    }
    Alert.alert('መለለዪ ሰርዝ', 'መለለዪኻ ብቐዋምነት ክስረዝ ትደሊ?', [
      { text: 'ይቕረ', style: 'cancel' },
      { text: 'ሰርዝ', style: 'destructive', onPress: () => { void removeAccount(); } },
    ]);
  };

  return (
    <Animated.View
      accessibilityViewIsModal
      onAccessibilityEscape={editing ? cancelEditing : onClose}
      style={[
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width,
          zIndex: 1,
          backgroundColor: theme.background,
        },
        drawerStyle,
      ]}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, Spacing.md) + Spacing.md,
          paddingBottom: Math.max(insets.bottom, Spacing.md) + Spacing.lg,
          paddingHorizontal: Spacing.md,
          gap: Spacing.lg,
          alignItems: 'center',
        }}>
        <ProfileCard
          {...(glassAvailable ? { glassEffectStyle: 'regular' as const, colorScheme } : {})}
          style={{
            width: cardWidth,
            minHeight: cardWidth / MembershipCard.aspectRatio,
            gap: Spacing.md,
            justifyContent: 'space-between',
            padding: Spacing.threeHalf,
            borderRadius: MembershipCard.radius,
            borderCurve: 'continuous',
            backgroundColor: glassAvailable ? undefined : theme.surface,
            borderWidth: 1,
            borderColor: glassAvailable ? theme.glassBorder : theme.border,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md }}>
            <View style={{ flex: 1, minWidth: 0, gap: Spacing.sm }}>
              {editing && user ? (
                <View style={{ width: 72, height: 72 }}>
                  <Pressable
                    accessibilityLabel="ስእሊ መገለጺ ቀይር"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: pickingPhoto || busy }}
                    disabled={pickingPhoto || busy}
                    onPress={() => { void pickAvatar(); }}
                    style={({ pressed }) => ({ width: 72, height: 72, opacity: pressed ? 0.7 : 1 })}>
                    {removeAvatar ? (
                      <View style={{ width: ControlSize.avatar, height: ControlSize.avatar, borderRadius: Radius.full, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
                        <SymbolView name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }} size={30} tintColor={theme.text} />
                      </View>
                    ) : <ProfileAvatar size={ControlSize.avatar} previewUri={pendingAvatar?.uri} />}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.primaryAction,
                    }}>
                      <SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={13} tintColor={theme.primaryActionText} />
                    </View>
                  </Pressable>
                  {(pendingAvatar || avatar) && !removeAvatar ? (
                    <Pressable
                      accessibilityLabel="ስእሊ መገለጺ ሰርዝ"
                      accessibilityRole="button"
                      accessibilityState={{ disabled: pickingPhoto || busy }}
                      disabled={pickingPhoto || busy}
                      hitSlop={10}
                      onPress={() => { setPendingAvatar(null); setRemoveAvatar(true); }}
                      style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
                      <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={12} tintColor={theme.text} />
                    </Pressable>
                  ) : null}
                </View>
              ) : <ProfileAvatar size={ControlSize.avatar} />}
              {editing && user ? (
                <TextInput
                  accessibilityLabel="ስምካ ኣርም"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={40}
                  onChangeText={setNameDraft}
                  onSubmitEditing={() => { void saveProfile(); }}
                  placeholder="ስምካ"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  value={nameDraft}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    ...FormInputStyle,
                    minHeight: ControlSize.touch,
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.sm,
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                  }}
                />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <ThemedText type="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {user ? displayName || user.displayName || 'ስምካ ወስኽ' : 'ተጠቃሚ'}
                  </ThemedText>
                  {user && gold ? (
                    <View
                      accessibilityLabel="ሳራ ጎልድ ንጡፍ"
                      style={{ width: 25, height: 25, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8C882' }}>
                      <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={17} tintColor="#172222" />
                    </View>
                  ) : null}
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              {editing && user ? (
                <Pressable accessibilityLabel="ኣርም ሰርዝ" accessibilityRole="button" onPress={cancelEditing} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.textSecondary} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityLabel="ሳራ ጎልድ ርአ"
                accessibilityRole="button"
                onPress={() => openModal('/gold')}
                style={({ pressed }) => ({
                  width: ControlSize.touch,
                  height: ControlSize.touch,
                  borderRadius: Radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: gold ? '#E8C882' : theme.glass,
                  borderWidth: 1,
                  borderColor: gold ? '#E8C882' : theme.glassBorder,
                  opacity: pressed ? 0.7 : 1,
                })}>
                <SymbolView
                  name={{ ios: gold ? 'crown.fill' : 'crown', android: 'workspace_premium', web: 'workspace_premium' }}
                  size={20}
                  tintColor={gold ? '#172222' : theme.text}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityLabel={editing ? 'መገለጺ ዓቅብ' : user ? 'መገለጺ ኣርም' : 'እቶ'}
            accessibilityRole="button"
            accessibilityState={{ disabled: status === 'loading' || busy || pickingPhoto }}
            disabled={status === 'loading' || busy || pickingPhoto}
            onPress={() => {
              if (editing) void saveProfile();
              else if (user) startEditing();
              else openModal('/auth');
            }}
            style={({ pressed }) => ({
              alignSelf: 'stretch',
              minHeight: ControlSize.touch,
              justifyContent: 'center',
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.two,
              borderRadius: Radius.full,
              alignItems: 'center',
              backgroundColor: theme.primaryAction,
              opacity: status === 'loading' || busy || pickingPhoto ? 0.5 : pressed ? 0.75 : 1,
            })}>
            <ThemedText type="label" style={{ color: theme.primaryActionText }}>
              {status === 'loading' || busy ? '…' : editing ? 'ዓቅብ' : user ? 'ኣርም' : 'እቶ'}
            </ThemedText>
          </Pressable>
        </ProfileCard>
        {error ? <ThemedText type="caption" themeColor="danger">{error}</ThemedText> : null}

        {user ? (
          <View style={{ width: cardWidth, gap: Spacing.sm }}>
            <ThemedText type="label" themeColor="textSecondary" style={{ paddingHorizontal: Spacing.xs }}>መለለዪ</ThemedText>
            <AccountInformation email={user.email} />
            <View style={{ borderRadius: Radius.lg, borderCurve: 'continuous', backgroundColor: theme.surface, overflow: 'hidden' }}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void signOut(); }} style={({ pressed }) => ({ minHeight: ControlSize.field, justifyContent: 'center', padding: Spacing.md, borderRadius: Radius.lg, borderCurve: 'continuous', backgroundColor: theme.surface, opacity: busy || pressed ? 0.6 : 1 })}>
              <ThemedText type="label">ውጻእ</ThemedText>
            </Pressable>
            <View style={{ height: 1, marginHorizontal: Spacing.md, backgroundColor: theme.border }} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={({ pressed }) => ({ minHeight: ControlSize.field, justifyContent: 'center', padding: Spacing.md, borderRadius: Radius.lg, borderCurve: 'continuous', backgroundColor: theme.surface, opacity: busy || pressed ? 0.6 : 1 })}>
              <ThemedText type="label" themeColor="danger">መለለዪ ሰርዝ</ThemedText>
            </Pressable>
            </View>
          </View>
        ) : null}
        <View style={{ width: cardWidth, flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.md, rowGap: Spacing.xs, paddingHorizontal: Spacing.xs }}>
          <Pressable accessibilityRole="link" style={({ pressed }) => ({ minHeight: ControlSize.touch, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })} onPress={() => { void Linking.openURL(TERMS_OF_USE_URL); }}>
            <ThemedText type="caption" themeColor="textSecondary">ናይ ኣጠቓቕማ ውዕል</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" style={({ pressed }) => ({ minHeight: ControlSize.touch, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })} onPress={() => openModal('/privacy')}>
            <ThemedText type="caption" themeColor="textSecondary">ፖሊሲ ብሕትውና</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" style={({ pressed }) => ({ minHeight: ControlSize.touch, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })} onPress={() => { void Linking.openURL(`mailto:${SUPPORT_EMAIL}`); }}>
            <ThemedText type="caption" themeColor="textSecondary">ሓገዝ</ThemedText>
          </Pressable>
        </View>
        {ads.privacyRequired ? <Pressable accessibilityRole="button" onPress={() => { void ads.showPrivacyOptions(); }} style={{ minHeight: 44, justifyContent: 'center' }}>
          <ThemedText type="caption" themeColor="textSecondary">ምርጫታት ብሕትውና ማስታወቂያ</ThemedText>
        </Pressable> : null}
        <AdBanner visible={adsVisible} />
      </ScrollView>
    </Animated.View>
  );
}
