import { Host } from '@expo/ui';
import { Button } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  imageScale,
  labelStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import type { SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Platform,
  Pressable,
  useColorScheme,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

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

type NativeSymbol = NonNullable<ComponentProps<typeof Button>['systemImage']>;

function getIosSymbol(name: SymbolViewProps['name']): NativeSymbol {
  if (typeof name === 'string') return name as NativeSymbol;

  const platformName = (name as { ios?: string }).ios;
  return (platformName ?? 'circle') as NativeSymbol;
}

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
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const supportsNativeLiquidGlass = Number.isFinite(systemVersion) && systemVersion >= 26;

  if ((glass || filled) && supportsNativeLiquidGlass) {
    const hostSize = glass ? 52 : 44;

    return (
      <Host
        colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
        ignoreSafeArea="all"
        style={[{ width: hostSize, height: hostSize }, style]}>
        <Button
          label={accessibilityLabel}
          modifiers={[
            buttonStyle(filled ? 'glassProminent' : 'glass'),
            buttonBorderShape('circle'),
            controlSize(glass ? 'extraLarge' : 'large'),
            imageScale(size >= 22 ? 'large' : 'medium'),
            labelStyle('iconOnly'),
            tint(filled ? theme.primaryAction : theme.text),
            disabledModifier(disabled),
          ]}
          onPress={onPress}
          systemImage={getIosSymbol(name)}
        />
      </Host>
    );
  }

  const fallbackButton = (
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

  if (!glass) return fallbackButton;

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
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{fallbackButton}</View>
    </AdaptiveGlass>
  );
}
