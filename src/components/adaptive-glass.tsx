import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';

import type { AdaptiveGlassProps } from '@/components/adaptive-glass.types';
import { useTheme } from '@/hooks/use-theme';

export function AdaptiveGlass({
  children,
  style,
  strong = false,
}: AdaptiveGlassProps) {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <BlurView
      blurMethod="dimezisBlurViewSdk31Plus"
      intensity={strong ? 88 : 72}
      tint={colorScheme === 'dark' ? 'systemThinMaterialDark' : 'systemUltraThinMaterialLight'}
      style={[
        {
          overflow: 'hidden',
          backgroundColor: strong ? theme.glassStrong : theme.glass,
        },
        style,
      ]}>
      {children}
    </BlurView>
  );
}
