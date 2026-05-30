import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-36)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hasEffectRun = useRef(false);

  useEffect(() => {
    if (!hasEffectRun.current) {
      hasEffectRun.current = true;
      if (!isOnline) {
        setVisible(true);
        translateY.setValue(0);
        opacity.setValue(1);
      }
      return;
    }

    if (!isOnline) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -36, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [isOnline]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }], opacity }]}>
      <Text style={styles.text}>Kamu sedang offline. Menampilkan data terakhir.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.danger,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
