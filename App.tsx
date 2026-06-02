import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { Colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

// Inisialisasi Firebase Crashlytics — hanya aktif setelah expo prebuild (native build)
// Di Expo Go / development build tanpa native modules, blok ini di-skip secara aman.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getCrashlytics, setCrashlyticsCollectionEnabled, recordError } = require('@react-native-firebase/crashlytics');
  const cl = getCrashlytics();
  setCrashlyticsCollectionEnabled(cl, true);

  // Tangkap uncaught JS errors dan kirim ke Crashlytics sebelum crash handler default
  const prevHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    recordError(cl, error);
    prevHandler(error, isFatal);
  });
} catch {
  // Native module belum tersedia (Expo Go / sebelum prebuild) — skip
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bg }} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <RootNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
