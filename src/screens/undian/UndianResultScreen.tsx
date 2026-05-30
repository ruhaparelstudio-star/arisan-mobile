import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianResult'>;

export function UndianResultScreen({ navigation, route }: Props) {
  const { groupId, winnerName, winnerAmount, periodeKe } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} title={`Pemenang Periode ${periodeKe}`} />
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <View style={styles.heroDecor3} />
          <View style={styles.winnerLabel}>
            <Icon name="trophy" size={16} color={Colors.white} />
            <Text style={styles.winnerLabelText}>PEMENANG PERIODE {periodeKe}</Text>
          </View>
          <View style={styles.winnerAvatar}>
            <Text style={styles.winnerAvatarText}>{winnerName[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.winnerName}>{winnerName} 🎉</Text>
          {winnerAmount > 0 && (
            <Text style={styles.winnerAmount}>
              Menerima <Text style={styles.winnerAmountBold}>Rp {winnerAmount.toLocaleString('id')}</Text>
            </Text>
          )}
        </Animated.View>

        <View style={styles.infoBox}>
          <Icon name="shield" size={18} color={Colors.primaryInk} />
          <Text style={styles.infoText}>
            Hasil undian permanen dan telah disiarkan ke semua anggota grup.
          </Text>
        </View>

        <View style={styles.flex} />

        <Btn
          full size="lg" icon="message"
          onPress={() => navigation.navigate('Chat', { groupId, groupName: 'Grup', memberCount: 0 })}
          style={styles.cta}
        >
          Ucapkan selamat di chat
        </Btn>
        <Btn
          full size="md" variant="outline" icon="trophy"
          onPress={() => navigation.navigate('RiwayatPemenang', { groupId, groupName: 'Grup' })}
          style={styles.ctaSecondary}
        >
          Lihat semua pemenang
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 32 },
  hero: {
    borderRadius: 24, padding: 26, overflow: 'hidden', position: 'relative',
    backgroundColor: Colors.primary, alignItems: 'center',
    shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 1, shadowRadius: 24, elevation: 12,
    marginBottom: 18,
  },
  heroDecor1: { position: 'absolute', left: 24, top: 28, width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '10deg' }] },
  heroDecor2: { position: 'absolute', right: 40, top: 40, width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '-18deg' }] },
  heroDecor3: { position: 'absolute', left: 60, bottom: 50, width: 10, height: 10, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)', transform: [{ rotate: '14deg' }] },
  winnerLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  winnerLabelText: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  winnerAvatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  winnerAvatarText: { fontFamily: Fonts.displaySemiBold, fontSize: 38, color: Colors.primaryInk, fontWeight: '600' },
  winnerName: { fontFamily: Fonts.displaySemiBold, fontSize: 26, color: Colors.white, letterSpacing: -0.4, fontWeight: '600' },
  winnerAmount: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, color: 'rgba(255,255,255,0.92)', marginTop: 8 },
  winnerAmountBold: { fontFamily: Fonts.displaySemiBold, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.primaryTint, borderRadius: 14, padding: 14 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  cta: { marginTop: 22 },
  ctaSecondary: { marginTop: 10 },
});
