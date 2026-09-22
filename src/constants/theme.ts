/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D1D1A',
    background: '#F8F7F3',
    backgroundElement: '#EEECE6',
    backgroundSelected: '#E4E1D9',
    textSecondary: '#6F6D66',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F0EB',
    surfaceAccent: '#DDF7EE',
    accent: '#147A5E',
    accentStrong: '#0A5A45',
    accentText: '#FFFFFF',
    border: '#DFDDD6',
    glass: 'rgba(255, 255, 255, 0.72)',
    glassStrong: 'rgba(255, 255, 255, 0.90)',
    glassBorder: 'rgba(36, 36, 32, 0.10)',
    primaryAction: '#11110F',
    primaryActionText: '#FFFFFF',
    danger: '#C93C37',
  },
  dark: {
    text: '#F5F4EF',
    background: '#171714',
    backgroundElement: '#282722',
    backgroundSelected: '#34332D',
    textSecondary: '#ABA9A1',
    surface: '#21211D',
    surfaceSecondary: '#292823',
    surfaceAccent: '#173E32',
    accent: '#77D7B5',
    accentStrong: '#97E9CC',
    accentText: '#10251E',
    border: '#393832',
    glass: 'rgba(42, 42, 38, 0.74)',
    glassStrong: 'rgba(48, 48, 43, 0.92)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    primaryAction: '#F5F4EF',
    primaryActionText: '#171714',
    danger: '#FF8D86',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  twoHalf: 12,
  three: 16,
  threeHalf: 20,
  four: 24,
  five: 32,
  xxl: 48,
  six: 64,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  full: 999,
} as const;

export const Shadows = {
  composer: '0 12px 36px rgba(20, 24, 21, 0.10)',
  subtle: '0 1px 3px rgba(20, 24, 21, 0.06)',
  glass: '0 6px 24px rgba(20, 24, 21, 0.08)',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
