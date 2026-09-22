import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { Radius, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SymbolButtonProps = {
  accessibilityLabel: string;
  name: SymbolViewProps['name'];
  onPress: () => void;
  disabled?: boolean;
  filled?: boolean;
  glass?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function SymbolButton({
  accessibilityLabel,
  name,
  onPress,
  disabled = false,
  filled = false,
  glass = false,
  size = 20,
  style,
}: SymbolButtonProps) {
  const theme = useTheme();

  const button = (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      pressRetentionOffset={12}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: Radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? theme.primaryAction : 'transparent',
          opacity: disabled ? 0.38 : pressed ? 0.62 : 1,
        },
        style,
      ]}>
      <SymbolView
        name={name}
        size={size}
        tintColor={filled ? theme.primaryActionText : theme.text}
        weight="semibold"
      />
    </Pressable>
  );

  if (!glass) return button;

  return (
    <AdaptiveGlass
      interactive
      style={{
        width: 52,
        height: 52,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: Shadows.glass,
      }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{button}</View>
    </AdaptiveGlass>
  );
}
