import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { savedConversations } from '@/data/chat-data';
import { useTheme } from '@/hooks/use-theme';

export default function HistoryScreen() {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = savedConversations.filter((conversation) =>
      `${conversation.title} ${conversation.preview}`.toLowerCase().includes(normalizedQuery),
    );

    return ['Today', 'Previous 7 days']
      .map((title) => ({
        title,
        data: filtered.filter((conversation) => conversation.section === title),
      }))
      .filter((section) => section.data.length > 0);
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          paddingTop: Math.max(insets.top, Spacing.sm),
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.sm,
        }}>
        <View
          style={{
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <SymbolButton
            accessibilityLabel="Back to chat"
            glass
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            onPress={() => router.replace('/')}
            size={21}
          />
          <View
            style={{
              height: 46,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ThemedText type="label">Aura</ThemedText>
          </View>
          <View style={{ width: 52, height: 52 }} />
        </View>
      </View>

      <SectionList
        contentContainerStyle={{
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.xxl,
          gap: Spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <AdaptiveGlass
            strong
            style={{
              minHeight: 54,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
              paddingHorizontal: Spacing.md,
              marginBottom: Spacing.md,
              borderRadius: Radius.full,
              borderWidth: 1,
              borderColor: theme.glassBorder,
              boxShadow: Shadows.glass,
            }}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={theme.textSecondary}
            />
            <TextInput
              accessibilityLabel="Search chats"
              onChangeText={setQuery}
              placeholder="Search chats"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="search"
              style={{ flex: 1, color: theme.text, fontSize: 16, paddingVertical: Spacing.twoHalf }}
              value={query}
            />
          </AdaptiveGlass>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl }}>
            <ThemedText type="headline">No chats found</ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              Try a different title or keyword.
            </ThemedText>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <ThemedText
            type="caption"
            themeColor="textSecondary"
            style={{ paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
            {section.title.toUpperCase()}
          </ThemedText>
        )}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace({ pathname: '/', params: { conversation: item.id } })}
            style={({ pressed }) => ({
              minHeight: 62,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.twoHalf,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: Radius.full,
              backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
            })}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.backgroundElement,
              }}>
              <SymbolView
                name={{ ios: 'bubble.left', android: 'chat_bubble', web: 'chat_bubble' }}
                size={17}
                tintColor={theme.textSecondary}
              />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <ThemedText type="label" numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                {item.preview}
              </ThemedText>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        )}
        stickySectionHeadersEnabled={false}
        style={{ flex: 1 }}
      />
    </View>
  );
}
