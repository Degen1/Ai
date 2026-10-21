import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function AssistantMark() {
  const theme = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 14, height: 26, justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: theme.assistantMark }} />
    </View>
  );
}
