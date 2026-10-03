import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfileSettings } from '@/data/profile-settings';

export function useAppColorScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const { theme } = useProfileSettings();
  return theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;
}
