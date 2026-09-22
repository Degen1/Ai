import { Host } from '@expo/ui';
import { Picker, Text } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  frame,
  glassEffect,
  pickerStyle,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import { Platform, Pressable, useColorScheme } from 'react-native';

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
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const systemVersion = Number.parseInt(String(Platform.Version), 10);
  const supportsNativeLiquidGlass = Number.isFinite(systemVersion) && systemVersion >= 26;

  if (!supportsNativeLiquidGlass) {
    return (
      <AdaptiveGlass
        strong
        style={{
          width: 178,
          height: 52,
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
                height: 42,
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

  return (
    <Host
      colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
      ignoreSafeArea="all"
      style={{ width: 178, height: 52 }}>
      <Picker
        label=""
        modifiers={[
          pickerStyle('segmented'),
          glassEffect({
            glass: { variant: 'regular', interactive: true },
            shape: 'capsule',
          }),
          frame({ width: 178, height: 52 }),
          accessibilityLabel('Conversation mode'),
        ]}
        onSelectionChange={(selection) => {
          if (selection === 'chat' || selection === 'work') onChange(selection);
        }}
        selection={mode}>
        <Text modifiers={[tag('chat')]}>Chat</Text>
        <Text modifiers={[tag('work')]}>Work</Text>
      </Picker>
    </Host>
  );
}
