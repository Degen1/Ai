import { useSyncExternalStore } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

const subscribe = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const colorScheme = useNativeColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
