import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PRIVACY_SECTIONS, SUPPORT_EMAIL } from '@/constants/privacy-policy';
import { Spacing } from '@/constants/theme';

export function PrivacyPolicyContent() {
  return (
    <View style={{ gap: Spacing.lg }}>
      <ThemedText type="body" selectable>እዚ ፖሊሲ ሳራ ሓበሬታኻ ብኸመይ ከም እትጥቀመሉ ይገልጽ።</ThemedText>
      {PRIVACY_SECTIONS.map((section) => (
        <View key={section.title} style={{ gap: Spacing.sm }}>
          <ThemedText type="headline">{section.title}</ThemedText>
          <ThemedText type="body" selectable>{section.body}</ThemedText>
        </View>
      ))}
      <ThemedText type="caption" themeColor="textSecondary">{SUPPORT_EMAIL}</ThemedText>
    </View>
  );
}
