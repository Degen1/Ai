import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConversationList } from '@/components/conversation-list';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HistoryDrawerProps = {
  adsVisible?: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  progress: SharedValue<number>;
  width: number;
};

export function HistoryDrawer({ adsVisible = true, onClose, onDelete, onNewChat, onSelect, progress, width }: HistoryDrawerProps) {
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
      <ConversationList adsVisible={adsVisible} compact onDelete={onDelete} onSelect={onSelect} />
      <Pressable
        accessibilityLabel="ሓድሽ ዕላል ጀምር"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onNewChat}
        style={({ pressed }) => ({
          position: 'absolute',
          right: Spacing.md,
          bottom: Math.max(insets.bottom, Spacing.md) + Spacing.md,
          width: 52,
          height: 52,
          borderRadius: Radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.primaryAction,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          opacity: pressed ? 0.72 : 1,
        })}>
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          size={25}
          tintColor={theme.primaryActionText}
        />
      </Pressable>
    </Animated.View>
  );
}
