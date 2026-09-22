import { View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AuraMark({ size = 44 }: { size?: number }) {
  const theme = useTheme();
  const innerSize = Math.round(size * 0.42);

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
        backgroundColor: theme.accentStrong,
      }}>
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: Radius.sm,
          borderCurve: 'continuous',
          backgroundColor: theme.accentText,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
