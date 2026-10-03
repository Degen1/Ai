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
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { TERMS_OF_USE_URL } from '@/constants/legal';
import { SUPPORT_EMAIL } from '@/constants/privacy-policy';
import { clearAccountProfile, removeProfileAvatar, saveProfileAvatar, setProfileDisplayName, useAccountProfile } from '@/data/profile-settings';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { deleteAccount, logout, updateAccountName } from '@/services/auth-service';
import { getGoldStatus, subscribeGoldStatus } from '@/services/gold-subscription';

type ProfileDrawerProps = {
  onClose: () => void;
  progress: SharedValue<number>;
  width: number;
};

type PendingAvatar = { uri: string; base64: string };

export function ProfileDrawer({ onClose, progress, width }: ProfileDrawerProps) {
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
  const cardWidth = width - Spacing.md * 2;
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
    onClose();
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
        }}>
        <ProfileCard
          {...(glassAvailable ? { glassEffectStyle: 'regular' as const, colorScheme } : {})}
          style={{
            width: cardWidth,
            aspectRatio: 1.586,
            justifyContent: 'space-between',
            padding: Spacing.threeHalf,
            borderRadius: 22,
            backgroundColor: glassAvailable ? undefined : theme.surface,
            borderWidth: 1,
            borderColor: glassAvailable ? theme.glassBorder : theme.border,
          }}>
          {editing && user ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ width: 72, height: 72 }}>
                <Pressable
                  accessibilityLabel="ስእሊ መገለጺ ቀይር"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: pickingPhoto || busy }}
                  disabled={pickingPhoto || busy}
                  onPress={() => { void pickAvatar(); }}
                  style={({ pressed }) => ({ width: 72, height: 72, opacity: pressed ? 0.7 : 1 })}>
                  {removeAvatar ? (
                    <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
                      <SymbolView name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }} size={30} tintColor={theme.text} />
                    </View>
                  ) : <ProfileAvatar size={68} previewUri={pendingAvatar?.uri} />}
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
              <Pressable accessibilityLabel="ኣርም ሰርዝ" accessibilityRole="button" onPress={cancelEditing} hitSlop={8}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={18} tintColor={theme.textSecondary} />
              </Pressable>
            </View>
          ) : <ProfileAvatar size={68} />}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm }}>
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
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  paddingHorizontal: Spacing.two,
                  borderRadius: Radius.sm,
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  fontSize: 17,
                }}
              />
            ) : (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <ThemedText type="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {user ? displayName || user.displayName || 'ስምካ ወስኽ' : 'መገለጺኻ'}
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
                minWidth: 66,
                paddingHorizontal: Spacing.twoHalf,
                paddingVertical: Spacing.two,
                borderRadius: Radius.full,
                alignItems: 'center',
                backgroundColor: theme.primaryAction,
                opacity: pressed ? 0.75 : 1,
              })}>
              <ThemedText type="label" style={{ color: theme.primaryActionText }}>
                {status === 'loading' || busy ? '…' : editing ? 'ዓቅብ' : user ? 'ኣርም' : 'እቶ'}
              </ThemedText>
            </Pressable>
          </View>
        </ProfileCard>
        {error ? <ThemedText type="caption" themeColor="danger">{error}</ThemedText> : null}

        <View style={{ gap: Spacing.sm }}>
          <ThemedText type="label" themeColor="textSecondary" style={{ paddingHorizontal: Spacing.xs }}>መልክዕ</ThemedText>
          <ThemeSwitcher width={cardWidth} />
        </View>

        <Pressable
          accessibilityLabel="ግዝኢታት ርአ"
          accessibilityRole="button"
          onPress={() => openModal('/gold')}
          style={({ pressed }) => ({
            width: cardWidth,
            minHeight: 58,
            paddingHorizontal: Spacing.md,
            borderRadius: Radius.lg,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.twoHalf,
            opacity: pressed ? 0.72 : 1,
          })}>
          <SymbolView name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} size={22} tintColor={theme.text} />
          <ThemedText type="label" style={{ flex: 1 }}>ግዝኢታት</ThemedText>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={theme.textSecondary} />
        </Pressable>

        {user ? (
          <View style={{ width: cardWidth, gap: Spacing.sm }}>
            <ThemedText type="label" themeColor="textSecondary" style={{ paddingHorizontal: Spacing.xs }}>መለለዪ</ThemedText>
            <AccountInformation email={user.email} />
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void signOut(); }} style={{ padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: theme.surface }}>
              <ThemedText type="label">ውጻእ</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={{ padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: theme.surface }}>
              <ThemedText type="label" themeColor="danger">መለለዪ ሰርዝ</ThemedText>
            </Pressable>
          </View>
        ) : null}
        <View style={{ width: cardWidth, flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Spacing.xs }}>
          <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(TERMS_OF_USE_URL); }}>
            <ThemedText type="caption" themeColor="textSecondary">ናይ ኣጠቓቕማ ውዕል</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => openModal('/privacy')}>
            <ThemedText type="caption" themeColor="textSecondary">ፖሊሲ ብሕትውና</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(`mailto:${SUPPORT_EMAIL}`); }}>
            <ThemedText type="caption" themeColor="textSecondary">ሓገዝ</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
