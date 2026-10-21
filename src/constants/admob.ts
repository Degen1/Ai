// Live ads are the default. Enable demo units explicitly when testing ad interactions.
export const USE_TEST_ADS = process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === 'true';

// Sara-specific public ad unit IDs.
export const REWARDED_AD_UNIT_IDS = {
  ios: 'ca-app-pub-8642966339570216/8499904090',
  android: 'ca-app-pub-8642966339570216/2580614571',
} as const;

// Production banner IDs are separate from the rewarded-ad units.
export const BANNER_AD_UNIT_IDS = {
  ios: 'ca-app-pub-8642966339570216/9162037040',
  android: 'ca-app-pub-8642966339570216/1283547027',
} as const;
