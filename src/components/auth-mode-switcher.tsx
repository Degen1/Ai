import { Pressable, useWindowDimensions } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { authSwitcherHeight, authSwitcherWidth } from '@/components/auth-mode-switcher-size';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AuthMode = 'login' | 'register';

export function AuthModeSwitcher({ mode, onChange, isDisabled = false }: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  isDisabled?: boolean;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const width = authSwitcherWidth(screenWidth);
  const theme = useTheme();

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
