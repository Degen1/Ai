export type AdsSdk = typeof import('react-native-google-mobile-ads');
// AdMob is native-only. Keep its native bindings out of the web runtime.
export function getAdsSdk(): AdsSdk | null { return null; }
