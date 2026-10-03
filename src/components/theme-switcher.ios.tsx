import { Host } from '@expo/ui';
import { Picker, Text } from '@expo/ui/swift-ui';
import { accessibilityLabel, controlSize, frame, glassEffect, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Platform, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { setThemePreference, type ThemePreference, useProfileSettings } from '@/data/profile-settings';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const options: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'ብርሃን' },
  { value: 'system', label: 'ተቐያያሪ' },
  { value: 'dark', label: 'ጸልማት' },
];

export function ThemeSwitcher({ width }: { width: number }) {
  const { theme: selected } = useProfileSettings();
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const supportsNativeLiquidGlass = Number.isFinite(systemVersion) && systemVersion >= 26;

  if (!supportsNativeLiquidGlass) {
    return (
      <View
        accessibilityRole="radiogroup"
        style={{
          width,
          minHeight: 52,
          padding: Spacing.xs,
          flexDirection: 'row',
          borderRadius: Radius.full,
          backgroundColor: theme.backgroundElement,
        }}>
        {options.map(({ value, label }) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected === value }}
            onPress={() => setThemePreference(value)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.full,
              backgroundColor: selected === value ? theme.surface : 'transparent',
              opacity: pressed ? 0.65 : 1,
            })}>
            <ThemedText numberOfLines={1} type="label" style={{ fontSize: 13, lineHeight: 18, textAlign: 'center' }}>
              {label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <Host colorScheme={colorScheme} ignoreSafeArea="all" style={{ width, height: 52 }}>
      <Picker
        label=""
        modifiers={[
          pickerStyle('segmented'),
          controlSize('regular'),
          glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'capsule' }),
          frame({ width, height: 52 }),
          accessibilityLabel('መልክዕ ኣፕ'),
        ]}
        onSelectionChange={(selection) => {
          if (selection === 'light' || selection === 'system' || selection === 'dark') {
            setThemePreference(selection);
          }
        }}
        selection={selected}>
        {options.map(({ value, label }) => (
          <Text key={value} modifiers={[tag(value)]}>{label}</Text>
        ))}
      </Picker>
    </Host>
  );
}
