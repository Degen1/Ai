import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const dotWave = {
  '0%': { opacity: 0.4, transform: [{ translateY: 0 }, { scale: 0.9 }] },
  '25%': { opacity: 1, transform: [{ translateY: -4 }, { scale: 1 }] },
  '50%': { opacity: 0.4, transform: [{ translateY: 0 }, { scale: 0.9 }] },
  '100%': { opacity: 0.4, transform: [{ translateY: 0 }, { scale: 0.9 }] },
} as const;

export function ThinkingIndicator() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <View
      accessible
      accessibilityLabel="ሳራ መልሲ ትዳሉ ኣላ"
      accessibilityRole="progressbar"
      style={{ width: 34, height: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.textSecondary,
            opacity: reducedMotion ? 0.75 : 0.4,
            animationName: reducedMotion ? 'none' : dotWave,
            animationDuration: 1050,
            animationDelay: index * 150,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}
    </View>
  );
}
