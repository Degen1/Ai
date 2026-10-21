import { TurboModuleRegistry } from 'react-native';
export type AdsSdk = typeof import('react-native-google-mobile-ads');
let sdk: AdsSdk | null = null;
export function getAdsSdk(): AdsSdk | null {
  if (sdk) return sdk;
  if (!TurboModuleRegistry.get('RNGoogleMobileAdsModule')) return null;
  try {
    // Defer evaluating the native package until its module is present (Expo Go/web safety).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdk = require('react-native-google-mobile-ads') as AdsSdk;
    return sdk;
  } catch { return null; }
}
