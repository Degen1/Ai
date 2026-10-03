import { Host } from '@expo/ui';
import { Picker, Text } from '@expo/ui/swift-ui';
import { accessibilityLabel, controlSize, disabled, frame, glassEffect, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { Platform, Pressable, useWindowDimensions } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { authSwitcherHeight, authSwitcherWidth } from '@/components/auth-mode-switcher-size';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows } from '@/constants/theme';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type AuthMode = 'login' | 'register';

export function AuthModeSwitcher({ mode, onChange, isDisabled = false }: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  isDisabled?: boolean;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const width = authSwitcherWidth(screenWidth);
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const supportsNativeLiquidGlass = Number.isFinite(systemVersion) && systemVersion >= 26;

  if (!supportsNativeLiquidGlass) {
    return (
      <AdaptiveGlass strong style={{
        width,
        height: authSwitcherHeight,
        alignSelf: 'center',
        padding: 4,
        flexDirection: 'row',
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        boxShadow: Shadows.glass,
      }}>
        {(['login', 'register'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === item, disabled: isDisabled }}
            disabled={isDisabled}
            onPress={() => onChange(item)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.full,
              backgroundColor: mode === item ? theme.backgroundSelected : 'transparent',
              opacity: pressed ? 0.65 : 1,
            })}>
            <ThemedText type="label">{item === 'login' ? 'እቶ' : 'ተመዝገብ'}</ThemedText>
          </Pressable>
        ))}
      </AdaptiveGlass>
    );
  }

  return (
    <Host colorScheme={colorScheme} ignoreSafeArea="all" style={{ width, height: authSwitcherHeight, alignSelf: 'center' }}>
      <Picker
        label=""
        modifiers={[
          pickerStyle('segmented'),
          controlSize('large'),
          glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'capsule' }),
          frame({ width, height: authSwitcherHeight }),
          accessibilityLabel('እቶ ወይ ተመዝገብ'),
          disabled(isDisabled),
        ]}
        onSelectionChange={(selection) => {
          if (selection === 'login' || selection === 'register') onChange(selection);
        }}
        selection={mode}>
        <Text modifiers={[tag('login')]}>እቶ</Text>
        <Text modifiers={[tag('register')]}>ተመዝገብ</Text>
      </Picker>
    </Host>
  );
}
