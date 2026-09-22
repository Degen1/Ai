import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type AdaptiveGlassProps = {
  children: ReactNode;
  cornerRadius?: number;
  interactive?: boolean;
  shape?: 'capsule' | 'circle' | 'roundedRectangle';
  style?: StyleProp<ViewStyle>;
  glassStyle?: 'regular' | 'clear';
  strong?: boolean;
};
