import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AdsProvider } from '@/hooks/use-ads';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { AuthSessionProvider } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { configureGoldSubscriptions } from '@/services/gold-subscription';
import { AppFontNativeFamily } from '@/constants/theme';

configureGoldSubscriptions();
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    AbyssinicaSIL: require('../../assets/fonts/AbyssinicaSIL-Regular.ttf'),
  });
  const colorScheme = useAppColorScheme();
  const theme = useTheme();

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <AuthSessionProvider>
            <AdsProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerBackButtonDisplayMode: 'minimal',
                  headerShadowVisible: false,
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerTitleStyle: { fontFamily: AppFontNativeFamily, fontSize: 17, fontWeight: '400' },
                  contentStyle: { backgroundColor: theme.background },
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="gold" options={{ title: '', presentation: 'modal' }} />
                <Stack.Screen name="auth" options={{ title: '', presentation: 'modal', headerShown: false, sheetGrabberVisible: false }} />
                <Stack.Screen name="privacy" options={{ title: 'ፖሊሲ ብሕትውና' }} />
                <Stack.Screen
                  name="history"
                  options={{
                    title: 'ሳራ',
                    headerLargeTitleEnabled: false,
                  }}
                />
              </Stack>
            </AdsProvider>
          </AuthSessionProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
