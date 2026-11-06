import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { QuestionReward } from '@/hooks/use-ads';
import { useTheme } from '@/hooks/use-theme';

const duration = 2200;
const colors = ['#3478F6', '#F54D65', '#F5B842', '#2DBB91', '#A679F4'];
const badgePop = {
  '0%': { opacity: 0, transform: [{ scale: 0.94 }] },
  '8%': { opacity: 1, transform: [{ scale: 1 }] },
  '86%': { opacity: 1, transform: [{ scale: 1 }] },
  '100%': { opacity: 0, transform: [{ scale: 1 }] },
} as const;
const confetti = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * 2 * Math.PI;
  const x = Math.cos(angle) * (86 + (index % 3) * 10);
  const y = Math.sin(angle) * (40 + (index % 3) * 8);
  return {
    color: colors[index % colors.length],
    round: index % 3 === 0,
    delay: (index % 3) * 35,
    burst: {
      '0%': { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }] },
      '12%': { opacity: 1 },
      '65%': { opacity: 0.9, transform: [{ translateX: x }, { translateY: y - 13 }, { rotate: '120deg' }] },
      '100%': { opacity: 0, transform: [{ translateX: x * 1.12 }, { translateY: y + 14 }, { rotate: '200deg' }] },
    } as const,
  };
});

export function QuestionRewardCelebration({ reward, onDismiss }: {
  reward: QuestionReward;
  onDismiss: (id: string) => void;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { amount, id } = reward;
  const lastHapticRewardId = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || lastHapticRewardId.current === id) return;
    lastHapticRewardId.current = id;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(`${amount} ተወሰኽቲ ሕቶታት ረኺብካ።`);
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [amount, id, onDismiss]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, height: 132, alignItems: 'center', justifyContent: 'center' }}>
      {!reduceMotion && confetti.map(({ color, round, delay, burst }, index) => (
        <Animated.View key={index} accessible={false} style={{
          position: 'absolute', left: '50%', top: '50%', width: 6, height: round ? 6 : 10,
          borderRadius: round ? 3 : 1, backgroundColor: color, opacity: 0,
          animationName: burst, animationDuration: 980, animationDelay: delay,
          animationTimingFunction: 'ease-out', animationFillMode: 'both',
        }} />
      ))}
      <Animated.View style={{
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.full, backgroundColor: theme.accent,
        animationName: reduceMotion ? 'none' : badgePop,
        animationDuration: duration, animationFillMode: 'both',
      }}>
        <ThemedText type="label" themeColor="accentText" accessibilityLiveRegion="polite">
          <ThemedText type="headline" themeColor="accentText">+{amount}</ThemedText>{' ተወሰኽቲ ሕቶታት'}
        </ThemedText>
      </Animated.View>
    </View>
  );
}
