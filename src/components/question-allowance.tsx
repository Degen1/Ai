import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAds } from '@/hooks/use-ads';
import { useTheme } from '@/hooks/use-theme';

export function QuestionAllowance({ thinking }: { thinking: boolean }) {
  const ads = useAds();
  const theme = useTheme();
  if (!ads.native || ads.gold || thinking) return null;
  const gated = ads.plan === 'free' && ads.remaining === 0 && !ads.adUnavailable;
  if (!gated && ads.plan !== 'error' && ads.plan !== 'checking' && !ads.message) return null;
  const loading = ads.plan === 'checking' || ads.rewardState === 'loading' || ads.rewardState === 'showing';
  return (
    <View style={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
      <View style={{ backgroundColor: theme.background, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm }}>
        {ads.plan === 'checking' ? <ActivityIndicator color={theme.textSecondary} accessibilityLabel="ኣባልነት ይረጋገጽ ኣሎ" /> : null}
        {ads.message ? <ThemedText type="caption" themeColor="textSecondary">{ads.message}</ThemedText> : null}
        {ads.plan === 'error' ? (
          <Pressable accessibilityRole="button" onPress={ads.retryPlan} style={{ minHeight: 44, justifyContent: 'center' }}>
            <ThemedText type="label">ኣባልነት ክረጋገጽ ኣይከኣለን። እንደገና ፈትን</ThemedText>
          </Pressable>
        ) : gated ? <>
          <ThemedText type="caption">ማስታወቂያ ብምርኣይ 2 ተወሰኽቲ ሕቶታት ርኸብ።</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Pressable accessibilityRole="button" disabled={loading || !ads.canWatch} onPress={() => { void ads.watchReward(); }}
              style={({ pressed }) => ({ flex: 1, minHeight: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm, backgroundColor: theme.primaryAction, opacity: pressed || loading ? 0.6 : 1 })}>
              {loading ? <ActivityIndicator color={theme.primaryActionText} /> : <ThemedText type="label" style={{ color: theme.primaryActionText }}>{ads.rewardState === 'ready' ? 'ማስታወቂያ ርአ' : 'እንደገና ፈትን'}</ThemedText>}
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push('/gold')} style={{ minHeight: 44, justifyContent: 'center' }}>
              <ThemedText type="label">ጎልድ</ThemedText>
            </Pressable>
          </View>
        </> : null}
      </View>
    </View>
  );
}
