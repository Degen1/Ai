import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConversationList } from '@/components/conversation-list';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const headerHeight = Math.max(insets.top, Spacing.sm) + 52 + Spacing.sm;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: Math.max(insets.top, Spacing.sm),
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.sm,
        }}>
        <View
          pointerEvents="box-none"
          style={{
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <SymbolButton
            accessibilityLabel="ናብ ዕላል ተመለስ"
            glass
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            onPress={() => router.replace('/')}
            size={21}
          />
          <View
            pointerEvents="none"
            style={{
              height: 46,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ThemedText type="label">ሳራ</ThemedText>
          </View>
          <View style={{ width: 52, height: 52 }} />
        </View>
      </View>

      <ConversationList
        onSelect={(id) => router.replace({ pathname: '/', params: { conversation: id } })}
        topPadding={headerHeight}
      />
    </View>
  );
}
