import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { ProfileAvatar } from '@/components/profile-avatar';
import { ThemedText } from '@/components/themed-text';
import { TERMS_OF_USE_URL } from '@/constants/legal';
import { Radius, Spacing } from '@/constants/theme';
import { useAccountProfile } from '@/data/profile-settings';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { buyGold, getGoldOptions, getGoldStatus, restoreGold } from '@/services/gold-subscription';

type GoldOptions = Awaited<ReturnType<typeof getGoldOptions>>;
type PlanStatus = 'loading' | 'free' | 'gold' | 'unavailable';
type Period = 'monthly' | 'annual';

export default function GoldScreen() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const { displayName } = useAccountProfile(user?.uid ?? null);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - Spacing.md * 2, 380);
  const cardHeight = cardWidth / 1.586;
  const name = user ? displayName || user.displayName || 'ስምካ' : 'መገለጺኻ';
  const [options, setOptions] = useState<GoldOptions | null>(null);
  const [planStatus, setPlanStatus] = useState<PlanStatus>('loading');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(false);

  const load = useCallback((isMounted: () => boolean) => {
    setLoading(true);
    setMessage(null);
    void Promise.allSettled([getGoldOptions(), getGoldStatus()])
      .then(([optionsResult, statusResult]) => {
        if (!isMounted()) return;
        setPlanStatus(statusResult.status === 'fulfilled'
          ? (statusResult.value ? 'gold' : 'free')
          : 'unavailable');
        if (optionsResult.status === 'fulfilled') {
          setOptions(optionsResult.value);
        } else {
          setOptions(null);
          const error = optionsResult.reason;
          setMessage(error instanceof Error && error.message === 'REVENUECAT_NOT_CONFIGURED'
            ? 'ናይ ሳራ ጎልድ ግዝኢት ኣብዚ ሕጂ ኣይተዳለወን።'
            : error instanceof Error && error.message === 'GOLD_OFFERING_UNAVAILABLE'
              ? 'ናይ ሳራ ጎልድ መደባት ካብ App Store ገና ኣይተረኽቡን። ድሒርካ ፈትን።'
            : 'ናይ ሳራ ጎልድ ኣማራጺታት ክጽዕኑ ኣይከኣሉን። መርበብካ ፈትሽ።');
        }
      })
      .finally(() => { if (isMounted()) setLoading(false); });
  }, []);

  useEffect(() => {
    mounted.current = true;
    load(() => mounted.current);
    return () => { mounted.current = false; };
  }, [load]);

  const purchase = async (period: Period) => {
    if (!options || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const isActive = await buyGold(options[period]);
      setPlanStatus(isActive ? 'gold' : 'free');
      setMessage(isActive ? 'ሳራ ጎልድ ተኸፊቱልካ ኣሎ።' : 'ግዝኢትካ ገና ኣይተረጋገጸን።');
    } catch (error) {
      if (!(typeof error === 'object' && error !== null && 'userCancelled' in error && error.userCancelled)) {
        setMessage('ግዝኢት ኣይተዛዘመን። እንደገና ፈትን።');
      }
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const isActive = await restoreGold();
      setPlanStatus(isActive ? 'gold' : 'free');
      setMessage(isActive ? 'ሳራ ጎልድ ተመሊሱልካ ኣሎ።' : 'ዝነጠፈ ናይ ሳራ ጎልድ ግዝኢት ኣይተረኽበን።');
    } catch {
      setMessage('ግዝኢትካ ክምለስ ኣይከኣለን። እንደገና ፈትን።');
    } finally {
      setBusy(false);
    }
  };

  const price = (aPackage: PurchasesPackage, period: Period) =>
    `${aPackage.product.priceString} / ${period === 'annual' ? 'ዓመት' : 'ወርሒ'}`;
  const twoMonthsIncluded = options &&
    options.annual.product.currencyCode === options.monthly.product.currencyCode &&
    Math.abs(options.annual.product.price - options.monthly.product.price * 10) < 0.01;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xxl,
        gap: Spacing.md,
        flexGrow: 1,
        alignItems: 'center',
      }}>
      <View style={{
        width: cardWidth,
        height: cardHeight,
        justifyContent: 'space-between',
        padding: Spacing.threeHalf,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surface,
      }}>
        <ProfileAvatar size={62} />
        <View style={{ gap: Spacing.xs }}>
          <ThemedText type="headline" numberOfLines={1}>{name}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {planStatus === 'gold' ? 'ጎልድ · ንጡፍ'
              : planStatus === 'free' ? 'ነጻ'
                : planStatus === 'loading' ? 'ይጽዕን ኣሎ…' : 'መደብ ኣይተረጋገጸን'}
          </ThemedText>
        </View>
      </View>

      <View style={{
        width: cardWidth,
        height: cardHeight,
        justifyContent: 'space-between',
        padding: Spacing.threeHalf,
        borderRadius: 22,
        backgroundColor: '#172222',
        borderWidth: 1,
        borderColor: '#B99A58',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <ProfileAvatar size={62} />
          <ThemedText type="caption" style={{ color: '#E8C882', letterSpacing: 1.4 }}>ሳራ · ጎልድ</ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <ThemedText type="headline" numberOfLines={1} style={{ color: '#FFFFFF', flexShrink: 1 }}>{name}</ThemedText>
          <View style={{ width: 23, height: 23, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8C882' }}>
            <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={16} tintColor="#172222" />
          </View>
        </View>
        {options ? (
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['monthly', 'annual'] as const).map((period) => (
              <Pressable
                key={period}
                accessibilityLabel={`${period === 'monthly' ? 'ወርሓዊ' : 'ዓመታዊ'} ጎልድ ${price(options[period], period)}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => { void purchase(period); }}
                style={({ pressed }) => ({
                  flex: 1,
                  minWidth: 0,
                  minHeight: 53,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Radius.md,
                  backgroundColor: pressed ? '#D9BB79' : '#F0D69E',
                  opacity: busy ? 0.6 : 1,
                })}>
                <ThemedText type="caption" style={{ color: '#172222', fontWeight: '700' }}>
                  {period === 'monthly' ? 'ወርሓዊ' : 'ዓመታዊ'}
                </ThemedText>
                <ThemedText type="caption" numberOfLines={1} style={{ color: '#172222', fontSize: 11 }}>
                  {price(options[period], period)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ minHeight: 53, justifyContent: 'center' }}>
            {loading ? <ActivityIndicator color="#E8C882" /> : <ThemedText type="caption" style={{ color: '#E8C882' }}>ዋጋ ሕጂ ኣይተረኽበን</ThemedText>}
          </View>
        )}
      </View>

      {twoMonthsIncluded ? (
        <ThemedText type="caption" style={{ color: '#98732E' }}>ዓመታዊ: ምስ ወርሓዊ ዋጋ ክነጻጸር ከሎ፡ 2 ወርሒ ብነጻ</ThemedText>
      ) : null}
      {message ? <ThemedText type="body" themeColor="textSecondary" style={{ textAlign: 'center' }}>{message}</ThemedText> : null}
      {!loading && !options ? (
        <Pressable accessibilityRole="button" onPress={() => load(() => mounted.current)}>
          <ThemedText type="label" themeColor="accent">እንደገና ፈትን</ThemedText>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" disabled={busy || loading} onPress={() => { void restore(); }}>
        <ThemedText type="label" themeColor="accent">ግዝኢት መልስ</ThemedText>
      </Pressable>
      <ThemedText type="caption" themeColor="textSecondary" style={{ maxWidth: cardWidth, textAlign: 'center' }}>
        ግዝኢትካ ባዕልኻ እንተዘይሰሪዝካዮ ይሕደስ። ዋጋ ካብ App Store ይርአ።
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: Spacing.lg }}>
        <Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(TERMS_OF_USE_URL); }}>
          <ThemedText type="caption" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>ናይ ኣጠቓቕማ ውዕል</ThemedText>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')}>
          <ThemedText type="caption" themeColor="textSecondary" style={{ textDecorationLine: 'underline' }}>ፖሊሲ ብሕትውና</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}
