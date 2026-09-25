import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConversationList } from '@/components/conversation-list';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HistoryDrawerProps = {
  onClose: () => void;
  onSelect: (id: string) => void;
  progress: SharedValue<number>;
  width: number;
};

export function HistoryDrawer({ onClose, onSelect, progress, width }: HistoryDrawerProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.get() - 1) * width }],
  }));

  return (
    <Animated.View
      accessibilityViewIsModal
      onAccessibilityEscape={onClose}
      style={[
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width,
          zIndex: 1,
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, Spacing.md) + Spacing.md,
          paddingBottom: insets.bottom,
        },
        drawerStyle,
      ]}>
      <ThemedText type="headline" style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.md }}>
        ዕላላት
      </ThemedText>
      <ConversationList compact onSelect={onSelect} />
    </Animated.View>
  );
}
