import { View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

export function SaraMark({ size = 44, transparentCenter = false }: { size?: number; transparentCenter?: boolean }) {
  const innerSize = Math.round(size * 0.42);
  const isDark = useAppColorScheme() === 'dark';
  const isCutout = transparentCenter || isDark;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isCutout ? 'transparent' : '#FF0000',
        borderColor: '#FF0000',
        borderWidth: isCutout ? (size - innerSize) / 2 : 0,
      }}>
      {isCutout ? null : <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: Radius.sm,
          borderCurve: 'continuous',
          backgroundColor: '#FFFFFF',
          transform: [{ rotate: '45deg' }],
        }}
      />}
    </View>
  );
}
