import { View } from 'react-native';

import { Radius } from '@/constants/theme';

export function SaraMark({ size = 44 }: { size?: number }) {
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
        backgroundColor: '#2878F0',
      }}>
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: Radius.sm,
          borderCurve: 'continuous',
          backgroundColor: '#FFFFFF',
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
