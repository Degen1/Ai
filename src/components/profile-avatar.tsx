import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, View } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { SaraMark } from '@/components/sara-mark';
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
      backgroundColor: imageUri ? theme.backgroundElement : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: size, height: size }} />
      ) : (
        <SaraMark size={Math.round(size * 0.72)} transparentCenter />
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

  return (
    <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
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
        <Pressable
          accessibilityLabel="መገለጺ ክፈት"
          accessibilityRole="button"
          onPress={onPress}
          hitSlop={8}
          style={({ pressed }) => ({
            width: visualSize,
            height: visualSize,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}>
          {avatar ? (
            <ProfileAvatar size={nativeGlass ? 38 : 42} />
          ) : (
            <SymbolView
              name={{ ios: 'person', android: 'person_outline', web: 'person_outline' }}
              size={22}
              tintColor={theme.text}
            />
          )}
        </Pressable>
      </AdaptiveGlass>
    </View>
  );
}
