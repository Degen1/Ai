import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SuggestionCardProps = {
  icon: SymbolViewProps['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function SuggestionCard({ icon, title, subtitle, onPress }: SuggestionCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityHint={`Sends: ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        gap: Spacing.twoHalf,
        borderRadius: Radius.full,
        backgroundColor: pressed ? theme.backgroundElement : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}>
      <View
        style={{
          width: 38,
          height: 38,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: Radius.full,
          backgroundColor: theme.backgroundElement,
        }}>
        <SymbolView name={icon} size={20} tintColor={theme.textSecondary} weight="medium" />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="body" themeColor="textSecondary" numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
    </Pressable>
  );
}
