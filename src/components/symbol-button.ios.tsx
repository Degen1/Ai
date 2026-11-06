import { Host } from '@expo/ui';
import { Button, Image as NativeImage, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  aspectRatio,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  controlSize,
  disabled as disabledModifier,
  foregroundStyle,
  frame,
  imageScale,
  labelStyle,
  resizable,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { Image } from 'expo-image';
import type { SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { Radius, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

type SymbolButtonProps = {
  accessibilityLabel: string;
  name: SymbolViewProps['name'];
  onPress: () => void;
  disabled?: boolean;
  filled?: boolean;
  glass?: boolean;
  iconColor?: string;
  imageUri?: string | null;
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
  iconColor,
  imageUri,
  size = 20,
  style,
}: SymbolButtonProps) {
  const colorScheme = useAppColorScheme();
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
          label={glass ? undefined : accessibilityLabel}
          systemImage={glass ? undefined : getIosSymbol(name)}
          modifiers={[
            buttonStyle(filled ? 'glassProminent' : 'glass'),
            buttonBorderShape('circle'),
            controlSize(glass ? 'extraLarge' : 'large'),
            accessibilityLabelModifier(accessibilityLabel),
            ...(!glass ? [imageScale(size >= 22 ? 'large' : 'medium'), labelStyle('iconOnly')] : []),
            tint(filled ? theme.primaryAction : theme.text),
            ...(iconColor ? [foregroundStyle(iconColor)] : []),
            disabledModifier(disabled),
          ]}
          onPress={onPress}>
          {/* A fixed label footprint keeps glass circles equal for every symbol/avatar. */}
          {glass ? <ZStack modifiers={[frame({ width: 22, height: 22 })]}>
            {imageUri ? (
              <NativeImage
                uiImage={imageUri}
                modifiers={[resizable(), aspectRatio({ contentMode: 'fill' }), frame({ width: 38, height: 38 }), clipShape('circle')]}
              />
            ) : (
              <NativeImage systemName={getIosSymbol(name)} size={size} />
            )}
          </ZStack> : undefined}
        </Button>
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
      {imageUri ? (
        <Image source={{ uri: imageUri }} contentFit="cover" style={{ width: 42, height: 42, borderRadius: Radius.full }} />
      ) : <SymbolView
        name={name}
        size={size}
        tintColor={iconColor ?? (filled ? theme.primaryActionText : theme.text)}
        weight="semibold"
      />}
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
