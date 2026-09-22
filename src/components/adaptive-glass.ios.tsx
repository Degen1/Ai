import { Host } from '@expo/ui';
import { Spacer, ZStack } from '@expo/ui/swift-ui';
import { glassEffect } from '@expo/ui/swift-ui/modifiers';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, useColorScheme, View } from 'react-native';

import type { AdaptiveGlassProps } from '@/components/adaptive-glass.types';
import { useTheme } from '@/hooks/use-theme';

export function AdaptiveGlass({
  children,
  cornerRadius = 24,
  interactive = false,
  shape = 'capsule',
  style,
  glassStyle = 'regular',
  strong = false,
}: AdaptiveGlassProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const supportsNativeLiquidGlass = Number.isFinite(systemVersion) && systemVersion >= 26;

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (isMounted) setReduceTransparency(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  if (reduceTransparency) {
    return (
      <View
        style={[
          {
            overflow: 'hidden',
            backgroundColor: strong ? theme.surface : theme.backgroundElement,
          },
          style,
        ]}>
        {children}
      </View>
    );
  }

  if (!supportsNativeLiquidGlass) {
    return (
      <BlurView
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

  return (
    <View
      style={[
        style,
        {
          backgroundColor: 'transparent',
          borderWidth: 0,
          boxShadow: 'none',
          overflow: 'visible',
          shadowOpacity: 0,
        },
      ]}>
      <Host
        colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}>
        <ZStack
          modifiers={[
            glassEffect({
              glass: {
                variant: glassStyle,
                interactive,
              },
              shape,
              cornerRadius,
            }),
          ]}>
          <Spacer />
        </ZStack>
      </Host>
      {children}
    </View>
  );
}
