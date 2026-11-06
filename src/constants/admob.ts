// Use live units in all builds unless test ads are explicitly enabled.
export const USE_TEST_ADS = process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === 'true';

// Sara-specific public ad unit IDs.
export const REWARDED_AD_UNIT_IDS = {
  ios: 'ca-app-pub-8642966339570216/8499904090',
  android: 'ca-app-pub-8642966339570216/2580614571',
} as const;
