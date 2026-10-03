import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { AuthSessionProvider } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { configureGoldSubscriptions } from '@/services/gold-subscription';

configureGoldSubscriptions();

export default function RootLayout() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AuthSessionProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerBackButtonDisplayMode: 'minimal',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: theme.background },
              }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="gold" options={{ title: '', presentation: 'modal' }} />
              <Stack.Screen name="auth" options={{ title: 'መለለዪ', presentation: 'modal' }} />
              <Stack.Screen
                name="history"
                options={{
                  title: 'ሳራ',
                  headerLargeTitleEnabled: false,
                }}
              />
            </Stack>
          </AuthSessionProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
