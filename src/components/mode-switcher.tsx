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
        width: 190,
        height: 60,
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
              alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.full,
              backgroundColor: selected ? theme.backgroundSelected : 'transparent',
              opacity: pressed ? 0.65 : 1,
            })}>
            <ThemedText
              type="label"
              themeColor={selected ? 'text' : 'textSecondary'}
              style={{ fontSize: 16, lineHeight: 22 }}>
              {item === 'chat' ? 'ዕላል' : 'ስራሕ'}
            </ThemedText>
          </Pressable>
        );
      })}
    </AdaptiveGlass>
  );
}
