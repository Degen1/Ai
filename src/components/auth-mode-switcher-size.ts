import { Spacing } from '@/constants/theme';

export const authSwitcherHeight = 48;

export function authSwitcherWidth(screenWidth: number) {
  return Math.max(0, Math.min(screenWidth - Spacing.lg * 2, 420));
}
