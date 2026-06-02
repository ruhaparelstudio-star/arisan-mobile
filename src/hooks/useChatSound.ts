import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const SOUND_FILE = require('../../assets/sounds/notification.wav');

export function useChatSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
        const { sound } = await Audio.Sound.createAsync(SOUND_FILE, { volume: 0.7 });
        if (mounted) soundRef.current = sound;
      } catch {
        // Gagal load sound tidak perlu ditampilkan ke user
      }
    }

    load();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playNotification = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Ignore playback error
    }
  }, []);

  return { playNotification };
}
