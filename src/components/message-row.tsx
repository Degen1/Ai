import { View } from 'react-native';

import { AuraMark } from '@/components/aura-mark';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/data/chat-data';

export function MessageRow({ message }: { message: ChatMessage }) {
  const theme = useTheme();

  if (message.role === 'user') {
    return (
      <View
        style={{
          width: '100%',
          maxWidth: MaxContentWidth,
          alignSelf: 'center',
          alignItems: 'flex-end',
          paddingHorizontal: Spacing.md,
        }}>
        <View
          style={{
            maxWidth: '86%',
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.twoHalf,
            borderRadius: Radius.full,
            backgroundColor: theme.backgroundElement,
          }}>
          <ThemedText type="body" selectable>
            {message.content}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        width: '100%',
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.twoHalf,
        paddingHorizontal: Spacing.md,
      }}>
      <AuraMark size={30} />
      <View style={{ flex: 1, paddingTop: 2, gap: Spacing.sm }}>
        <ThemedText type="label">Aura</ThemedText>
        <ThemedText type="body" selectable>
          {message.content}
        </ThemedText>
      </View>
    </View>
  );
}
