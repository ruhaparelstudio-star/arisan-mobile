import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
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
  const crashlytics = require('@react-native-firebase/crashlytics').default;
  const cl = crashlytics();
  cl.setCrashlyticsCollectionEnabled(true);

  // Tangkap uncaught JS errors dan kirim ke Crashlytics sebelum crash handler default
  const prevHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    cl.recordError(error);
    prevHandler(error, isFatal);
  });
} catch {
  // Native module belum tersedia (Expo Go / sebelum prebuild) — skip
}

// Atur handler notifikasi foreground — tampilkan notifikasi saat app aktif
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Kita mainkan suara manual lewat expo-av
    shouldSetBadge: true,
  }),
});

export default function App() {
  const notifSoundRef = useRef<Audio.Sound | null>(null);

  // Load notification sound sekali saat app mount
  useEffect(() => {
    let mounted = true;
    Audio.Sound.createAsync(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./assets/sounds/notification.wav'),
      { shouldPlay: false, volume: 1.0 },
    )
      .then(({ sound }) => { if (mounted) notifSoundRef.current = sound; })
      .catch(() => {});
    return () => {
      mounted = false;
      notifSoundRef.current?.unloadAsync();
    };
  }, []);

  // Play sound saat push notification masuk saat app di foreground
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      const sound = notifSoundRef.current;
      if (!sound) return;
      sound.setPositionAsync(0).catch(() => {});
      sound.playAsync().catch(() => {});
    });
    return () => sub.remove();
  }, []);

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
