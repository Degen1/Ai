import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppColorScheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
