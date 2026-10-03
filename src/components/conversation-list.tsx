import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SectionList, TextInput, View } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { deleteConversation, useConversations } from '@/data/conversation-store';
import { useTheme } from '@/hooks/use-theme';

type ConversationListProps = {
  compact?: boolean;
  onDelete?: (id: string) => void;
  onSelect: (id: string) => void;
  topPadding?: number;
};

export function ConversationList({ compact = false, onDelete, onSelect, topPadding = 0 }: ConversationListProps) {
  const [query, setQuery] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const theme = useTheme();
  const conversations = useConversations();

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = conversations.filter((conversation) =>
      `${conversation.title} ${conversation.preview}`.toLowerCase().includes(normalizedQuery),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const previousWeek = new Date(today);
    previousWeek.setDate(previousWeek.getDate() - 7);

    return [
      { title: 'ሎሚ', data: filtered.filter((item) => item.updatedAt >= today.getTime()) },
      { title: 'ዝሓለፉ 7 መዓልታት', data: filtered.filter((item) => item.updatedAt < today.getTime() && item.updatedAt >= previousWeek.getTime()) },
      { title: 'ካብዚ ቀደም', data: filtered.filter((item) => item.updatedAt < previousWeek.getTime()) },
    ]
      .filter((section) => section.data.length > 0);
  }, [conversations, query]);

  const remove = (id: string) => {
    try {
      deleteConversation(id);
      setMenuId(null);
      setDeleteError(null);
      onDelete?.(id);
    } catch {
      setDeleteError('እዚ ዕላል ክስረዝ ኣይከኣለን። እንደገና ፈትን።');
    }
  };

  const confirmDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('እዚ ዕላል ብቐዋምነት ክስረዝ?')) remove(id);
      return;
    }
    Alert.alert('ዕላል ሰርዝ', 'እዚ ዕላል ብቐዋምነት ክስረዝ?', [
      { text: 'ይቕረ', style: 'cancel' },
      { text: 'ሰርዝ', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <SectionList
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: compact ? Spacing.twoHalf : Spacing.md,
        paddingTop: topPadding,
        paddingBottom: compact ? 112 : Spacing.xxl,
        gap: Spacing.sm,
      }}
      keyboardShouldPersistTaps="handled"
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
        <AdaptiveGlass
          strong
          style={{
            minHeight: compact ? 44 : 54,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: compact ? Spacing.twoHalf : Spacing.md,
            marginBottom: Spacing.md,
            borderRadius: Radius.full,
            borderWidth: 1,
            borderColor: theme.glassBorder,
            boxShadow: Shadows.glass,
          }}>
          {!compact ? (
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={18}
              tintColor={theme.textSecondary}
            />
          ) : null}
          <TextInput
            accessibilityLabel="ዕላላት ድለ"
            onChangeText={setQuery}
            placeholder="ዕላላት ድለ"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="search"
            style={{ flex: 1, color: theme.text, fontSize: compact ? 14 : 16, paddingVertical: Spacing.twoHalf }}
            value={query}
          />
        </AdaptiveGlass>
        {deleteError ? <ThemedText type="caption" themeColor="danger">{deleteError}</ThemedText> : null}
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxl }}>
          <ThemedText type={compact ? 'label' : 'headline'} style={{ textAlign: 'center' }}>
            ዕላላት ኣይተረኽቡን
          </ThemedText>
          {!compact ? (
            <ThemedText type="body" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              ካልእ ኣርእስቲ ወይ ቁልፊ ቃል ፈትን።
            </ThemedText>
          ) : null}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <ThemedText
          type="caption"
          themeColor="textSecondary"
          style={{ paddingTop: Spacing.md, paddingBottom: Spacing.sm }}>
          {section.title}
        </ThemedText>
      )}
      renderItem={({ item }) => (
        <View style={{ borderRadius: Radius.lg, backgroundColor: menuId === item.id ? theme.backgroundElement : 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => { setMenuId(null); onSelect(item.id); }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: compact ? 54 : 62,
                flexDirection: 'row',
                alignItems: 'center',
                gap: compact ? Spacing.sm : Spacing.twoHalf,
                paddingLeft: compact ? Spacing.sm : Spacing.md,
                paddingVertical: Spacing.sm,
                borderRadius: Radius.full,
                backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
              })}>
              {!compact ? (
                <View style={{ width: 38, height: 38, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.backgroundElement }}>
                  <SymbolView name={{ ios: 'bubble.left', android: 'chat_bubble', web: 'chat_bubble' }} size={17} tintColor={theme.textSecondary} />
                </View>
              ) : null}
              <View style={{ flex: 1, gap: 3 }}>
                <ThemedText type="label" numberOfLines={compact ? 2 : 1}>{item.title}</ThemedText>
                {!compact ? <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>{item.preview}</ThemedText> : null}
              </View>
            </Pressable>
            <Pressable
              accessibilityLabel={`ናይ ${item.title} ኣማራጺታት`}
              accessibilityRole="button"
              accessibilityState={{ expanded: menuId === item.id }}
              onPress={() => { setDeleteError(null); setMenuId(menuId === item.id ? null : item.id); }}
              hitSlop={4}
              style={{ width: 42, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <SymbolView name={{ ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' }} size={20} tintColor={theme.textSecondary} />
            </Pressable>
          </View>
          {menuId === item.id ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => confirmDelete(item.id)}
              style={{ alignSelf: 'flex-end', minHeight: 42, paddingHorizontal: Spacing.md, justifyContent: 'center' }}>
              <ThemedText type="label" themeColor="danger">ዕላል ሰርዝ</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
      stickySectionHeadersEnabled={false}
      style={{ flex: 1 }}
    />
  );
}
