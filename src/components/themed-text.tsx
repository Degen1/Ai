import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { AppFontFamily, Fonts, ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'headline'
    | 'body'
    | 'label'
    | 'caption'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? (type === 'linkPrimary' ? 'accent' : 'text')], fontFamily: AppFontFamily, fontWeight: '400' },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'headline' && styles.headline,
        type === 'body' && styles.body,
        type === 'label' && styles.label,
        type === 'caption' && styles.caption,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: Typography.small,
  smallBold: Typography.small,
  default: Typography.body,
  title: Typography.title,
  subtitle: Typography.subtitle,
  headline: Typography.headline,
  body: Typography.body,
  label: Typography.label,
  caption: Typography.caption,
  link: Typography.small,
  linkPrimary: { ...Typography.small, textDecorationLine: 'underline' },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
