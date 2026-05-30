import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/typography';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Kamu sedang offline. Menampilkan data terakhir.</Text>
    </View>
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
