import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform, View } from 'react-native';
import type { BannerAd } from 'react-native-google-mobile-ads';

import { ThemedText } from '@/components/themed-text';
import { BANNER_AD_UNIT_IDS, USE_TEST_ADS } from '@/constants/admob';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAds } from '@/hooks/use-ads';
import { getAdsSdk } from '@/services/ad-sdk';

export function AdBanner({ visible = true }: { visible?: boolean }) {
  const { adsReady } = useAds();
  const path = usePathname();
  if (!visible || !adsReady || (path !== '/' && path !== '/history')) return null;
  return <LoadedBanner />;
}

function LoadedBanner() {
  const sdk = getAdsSdk();
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const ref = useRef<BannerAd>(null);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (Platform.OS === 'ios' && state === 'active') ref.current?.load();
    });
    return () => listener.remove();
  }, []);
  if (!sdk || failed) return null;
  const unit = USE_TEST_ADS ? sdk.TestIds.ADAPTIVE_BANNER : BANNER_AD_UNIT_IDS[Platform.OS === 'ios' ? 'ios' : 'android'];
  if (!unit) return null;
  return (
    <View style={{ width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md }}>
      <View onLayout={({ nativeEvent }) => setWidth(Math.floor(nativeEvent.layout.width))} style={{ alignItems: 'center', gap: Spacing.xs }}>
        <ThemedText type="caption" themeColor="textSecondary">ማስታወቂያ</ThemedText>
        {width > 0 ? <sdk.BannerAd
          key={width}
          ref={ref}
          unitId={unit}
          size={sdk.BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
          width={width}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={() => setFailed(true)}
        /> : null}
      </View>
    </View>
  );
}
