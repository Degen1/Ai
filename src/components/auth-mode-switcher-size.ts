import { ProfileCardMaxWidth, Spacing } from '@/constants/theme';

export const authSwitcherHeight = 48;

export function authSwitcherWidth(screenWidth: number) {
  return Math.max(0, Math.min(screenWidth - Spacing.md * 2, ProfileCardMaxWidth));
}
