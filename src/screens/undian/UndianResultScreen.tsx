import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useAuth } from '../../hooks/useAuth';
import { undianApi, Winner } from '../../api/undian';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianResult'>;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function UndianResultScreen({ navigation, route }: Props) {
  const { groupId, groupName = 'Grup', winnerName, winnerAmount, periodeKe, ketuaId = '' } = route.params;
  const { token } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadWinners = useCallback(async () => {
    if (!token) return;
    try {
      const res = await undianApi.getHistory(groupId, token);
      setWinners([...res.winners].sort((a, b) => a.period_number - b.period_number));
    } catch {
      // silently fail — winners list is supplementary
    }
  }, [groupId, token]);

  useEffect(() => { loadWinners(); }, [loadWinners]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar onBack={() => navigation.goBack()} title={`Pemenang Periode ${periodeKe}`} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          {/* Winner spotlight */}
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

          {/* Daftar pemenang */}
          {winners.length > 0 && (
            <View style={styles.listSection}>
              <SectionLabel>Daftar pemenang</SectionLabel>
              <Card pad={6}>
                {winners.map((w, i) => {
                  const isCurrent = w.period_number === periodeKe;
                  return (
                    <View
                      key={w.period_number}
                      style={[
                        styles.winnerRow,
                        i < winners.length - 1 && styles.winnerBorder,
                        isCurrent && styles.winnerRowCurrent,
                      ]}
                    >
                      <View style={styles.periodNum}>
                        <Text style={styles.periodNumText}>{w.period_number}</Text>
                      </View>
                      <Avatar name={w.winner_name} size={36} />
                      <View style={styles.winnerInfo}>
                        <Text style={styles.winnerRowName}>{w.winner_name}</Text>
                        <Text style={styles.winnerRowDate}>{formatDate(w.drawn_at)}</Text>
                      </View>
                      {isCurrent && <Pill tone="solid">Baru</Pill>}
                    </View>
                  );
                })}
              </Card>
              <View style={styles.immutableNote}>
                <Icon name="lock" size={13} color={Colors.muted} />
                <Text style={styles.immutableText}>Daftar pemenang permanen — tidak bisa diubah</Text>
              </View>
            </View>
          )}

          <View style={styles.infoBox}>
            <Icon name="shield" size={18} color={Colors.primaryInk} />
            <Text style={styles.infoText}>
              Hasil undian permanen dan telah disiarkan ke semua anggota grup.
            </Text>
          </View>
        </View>

        <View>
          <Btn
            full size="lg" icon="message"
            onPress={() => navigation.navigate('Chat', { groupId, groupName, memberCount: 0, ketuaId })}
            style={styles.cta}
          >
            Ucapkan selamat di chat
          </Btn>
          <Btn
            full size="md" variant="outline" icon="trophy"
            onPress={() => navigation.navigate('RiwayatPemenang', { groupId, groupName })}
            style={styles.ctaSecondary}
          >
            Lihat semua pemenang
          </Btn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
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
  listSection: { marginBottom: 16 },
  winnerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 13, padding: 11, paddingHorizontal: 8,
  },
  winnerBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  winnerRowCurrent: {
    backgroundColor: Colors.primaryTint, borderRadius: 12, marginVertical: 2,
  },
  periodNum: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: Colors.borderStrong,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  periodNumText: { fontFamily: Fonts.displaySemiBold, fontSize: 13, color: Colors.mutedStrong, fontWeight: '600' },
  winnerInfo: { flex: 1 },
  winnerRowName: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  winnerRowDate: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 1 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.primaryTint, borderRadius: 14, padding: 14, marginBottom: 18 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  immutableNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10 },
  immutableText: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  cta: { marginTop: 4 },
  ctaSecondary: { marginTop: 10 },
});
