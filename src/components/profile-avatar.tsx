import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { SymbolButton } from '@/components/symbol-button';
import { Radius, Shadows } from '@/constants/theme';
import { useAccountProfile } from '@/data/profile-settings';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

export function ProfileAvatar({ size = 72, previewUri }: { size?: number; previewUri?: string }) {
  const { user } = useAuthSession();
  const { avatar } = useAccountProfile(user?.uid ?? null);
  const theme = useTheme();
  const imageUri = previewUri ?? avatar;

  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: size, height: size }} />
      ) : (
        <SymbolView name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }} size={Math.round(size * 0.44)} tintColor={theme.textSecondary} />
      )}
    </View>
  );
}

export function ProfileButton({ onPress }: { onPress: () => void }) {
  const { user } = useAuthSession();
  const { avatar } = useAccountProfile(user?.uid ?? null);
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const nativeGlass = Platform.OS === 'ios' && Number.isFinite(systemVersion) && systemVersion >= 26;
  const visualSize = nativeGlass ? 44 : 52;
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.get() }],
  }));

  if (nativeGlass) {
    return (
      <SymbolButton
        accessibilityLabel="መገለጺ ክፈት"
        glass
        imageUri={avatar}
        name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }}
        onPress={onPress}
        size={22}
      />
    );
  }

  return (
    <Pressable
      accessibilityLabel="መገለጺ ክፈት"
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => scale.set(withSpring(0.97, { duration: 150, dampingRatio: 1, reduceMotion: ReduceMotion.System }))}
      onPressOut={() => scale.set(withSpring(1, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System }))}
      hitSlop={8}
      pressRetentionOffset={12}
      style={({ pressed }) => ({ width: 52, height: 52, opacity: pressed ? 0.7 : 1 })}>
      <Animated.View style={[{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }, pressStyle]}>
        <AdaptiveGlass interactive style={{
          width: visualSize,
          height: visualSize,
          borderRadius: Radius.full,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: Shadows.glass,
        }}>
          <View pointerEvents="none" style={{
            width: visualSize,
            height: visualSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {avatar ? (
              <ProfileAvatar size={nativeGlass ? 38 : 42} />
            ) : (
              <SymbolView
                name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }}
                size={22}
                tintColor={theme.text}
              />
            )}
          </View>
        </AdaptiveGlass>
      </Animated.View>
    </Pressable>
  );
}
