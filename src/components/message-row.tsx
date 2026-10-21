import { Image } from 'expo-image';
import { View } from 'react-native';

import { AssistantMark } from '@/components/assistant-mark';
import { ReportResponse } from '@/components/report-response';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/data/chat-data';
import { useTheme } from '@/hooks/use-theme';

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
        <View style={{ alignItems: 'flex-end', gap: Spacing.xs, maxWidth: '86%' }}>
          {message.images?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.xs }}>
              {message.images.map((image) => (
                <Image
                  key={image.id}
                  accessibilityLabel="ዝተሰደደ ስእሊ"
                  source={{ uri: image.uri }}
                  style={{ width: 116, height: 116, borderRadius: Radius.md }}
                />
              ))}
            </View>
          ) : null}
          <View
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.twoHalf,
              borderRadius: Radius.lg, borderCurve: 'continuous',
              backgroundColor: theme.backgroundElement,
            }}>
            <ThemedText type="body" selectable>
              {message.content}
            </ThemedText>
          </View>
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
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
      }}>
      <AssistantMark />
      <View style={{ flex: 1 }}>
        <ThemedText type="body" selectable>
          {message.content}
        </ThemedText>
        <ReportResponse key={message.id} response={message.content} />
      </View>
    </View>
  );
}
