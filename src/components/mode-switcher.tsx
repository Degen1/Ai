import { Pressable } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AssistantMode = 'chat' | 'work';

export function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: AssistantMode;
  onChange: (mode: AssistantMode) => void;
}) {
  const theme = useTheme();

  return (
    <AdaptiveGlass
      strong
      style={{
        width: 170,
        height: 50,
        padding: 4,
        flexDirection: 'row',
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: theme.glassBorder,
        boxShadow: Shadows.glass,
      }}>
      {(['chat', 'work'] as const).map((item) => {
        const selected = mode === item;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={item}
            onPress={() => onChange(item)}
            style={({ pressed }) => ({
              flex: 1,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.full,
              backgroundColor: selected ? theme.backgroundSelected : 'transparent',
              opacity: pressed ? 0.65 : 1,
            })}>
            <ThemedText type="label" themeColor={selected ? 'text' : 'textSecondary'}>
              {item === 'chat' ? 'Chat' : 'Work'}
            </ThemedText>
          </Pressable>
        );
      })}
    </AdaptiveGlass>
  );
}
