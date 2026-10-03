import { ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PRIVACY_SECTIONS, SUPPORT_EMAIL } from '@/constants/privacy-policy';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg }}>
        <ThemedText type="body">እዚ ፖሊሲ ሳራ ሓበሬታኻ ብኸመይ ከም እትጥቀመሉ ይገልጽ።</ThemedText>
        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.title} style={{ gap: Spacing.xs }}>
            <ThemedText type="headline">{section.title}</ThemedText>
            <ThemedText type="body">{section.body}</ThemedText>
          </View>
        ))}
        <ThemedText type="caption" themeColor="textSecondary">{SUPPORT_EMAIL}</ThemedText>
      </View>
    </ScrollView>
  );
}
