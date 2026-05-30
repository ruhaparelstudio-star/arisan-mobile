import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { SectionLabel } from '../../components/ui/SectionLabel';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianResult'>;

type Winner = { period: number; name: string; date: string; current?: boolean };

const MOCK_WINNERS: Winner[] = [
  { period: 1, name: 'Budi Hartono', date: '15 Mar 2026' },
  { period: 2, name: 'Sari Wulandari', date: '15 Apr 2026' },
  { period: 3, name: 'Maya Indah', date: '15 Mei 2026' },
];

export function UndianResultScreen({ navigation, route }: Props) {
  const { groupId, winnerName, winnerAmount } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const currentPeriod = { period: 4, name: winnerName, date: '18 Jun 2026', current: true };
  const all = [...MOCK_WINNERS, currentPeriod];

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} title="Pemenang Periode 4" />
      <ScrollView contentContainerStyle={styles.body}>
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <View style={styles.heroDecor3} />
          <View style={styles.winnerLabel}>
            <Icon name="trophy" size={16} color={Colors.white} />
            <Text style={styles.winnerLabelText}>PEMENANG</Text>
          </View>
          <View style={styles.winnerAvatar}>
            <Text style={styles.winnerAvatarText}>{winnerName[0]}</Text>
          </View>
          <Text style={styles.winnerName}>{winnerName} 🎉</Text>
          <Text style={styles.winnerAmount}>
            Menerima <Text style={styles.winnerAmountBold}>Rp {(winnerAmount || 6000000).toLocaleString('id')}</Text>
          </Text>
          <Text style={styles.winnerDate}>Pelaksanaan 18 Juni 2026</Text>
        </Animated.View>

        <View style={styles.section}>
          <SectionLabel>Daftar pemenang</SectionLabel>
          <Card pad={6}>
            {all.map((w, i) => (
              <View
                key={w.period}
                style={[
                  styles.winnerRow,
                  i < all.length - 1 && styles.winnerBorder,
                  w.current && styles.winnerRowCurrent,
                ]}
              >
                <View style={styles.periodNum}>
                  <Text style={styles.periodNumText}>{w.period}</Text>
                </View>
                <Avatar name={w.name} size={36} />
                <View style={styles.flex}>
                  <Text style={styles.winnerRowName}>{w.name}</Text>
                  <Text style={styles.winnerRowDate}>{w.date}</Text>
                </View>
                {w.current && <Pill tone="solid">Baru</Pill>}
              </View>
            ))}
          </Card>
          <View style={styles.immutableNote}>
            <Icon name="lock" size={13} color={Colors.muted} />
            <Text style={styles.immutableText}>Daftar pemenang permanen — tidak bisa diubah</Text>
          </View>
        </View>

        <View style={styles.flex} />
        <Btn
          full size="lg" icon="message"
          onPress={() => navigation.navigate('Chat', { groupId, groupName: 'Grup', memberCount: 12 })}
          style={styles.cta}
        >
          Ucapkan selamat di chat
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  hero: {
    borderRadius: 24, padding: 26, overflow: 'hidden', position: 'relative',
    backgroundColor: Colors.primary, textAlign: 'center', alignItems: 'center',
    shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 18 }, shadowOpacity: 1, shadowRadius: 24, elevation: 12,
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
  winnerDate: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { marginTop: 22 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 11, paddingHorizontal: 8 },
  winnerBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  winnerRowCurrent: { backgroundColor: Colors.primaryTint, borderRadius: 12, margin: 2 },
  periodNum: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  periodNumText: { fontFamily: Fonts.displaySemiBold, fontSize: 13, color: Colors.mutedStrong, fontWeight: '600' },
  winnerRowName: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  winnerRowDate: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  immutableNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 },
  immutableText: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  cta: { marginTop: 22 },
});
