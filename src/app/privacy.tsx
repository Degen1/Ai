import { ScrollView, View } from 'react-native';

import { PrivacyPolicyContent } from '@/components/privacy-policy-content';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg }}>
        <PrivacyPolicyContent />
      </View>
    </ScrollView>
  );
}
