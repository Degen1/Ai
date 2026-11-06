import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isDevelopment = process.env.APP_VARIANT === 'development';
  const icon = isDevelopment ? './assets/images/icon-dev.png' : config.icon;

  return {
    ...config,
    name: isDevelopment ? 'ሳራ Dev' : (config.name ?? 'ሳራ'),
    slug: config.slug ?? 'ai',
    scheme: isDevelopment ? 'ai-dev' : config.scheme,
    icon,
    ios: {
      ...config.ios,
      icon,
      bundleIdentifier: isDevelopment ? 'com.degengebre.ai.dev' : config.ios?.bundleIdentifier,
      googleServicesFile: isDevelopment ? './GoogleService-Info.dev.plist' : config.ios?.googleServicesFile,
    },
    android: {
      ...config.android,
      package: isDevelopment ? 'com.degengebre.ai.dev' : config.android?.package,
      googleServicesFile: isDevelopment ? './google-services.dev.json' : config.android?.googleServicesFile,
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        foregroundImage: isDevelopment ? icon : config.android?.adaptiveIcon?.foregroundImage,
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      ['expo-dev-client', { addGeneratedScheme: isDevelopment }],
    ],
  };
};
