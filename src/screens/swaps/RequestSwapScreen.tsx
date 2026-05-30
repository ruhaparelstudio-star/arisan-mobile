import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { apiCall } from '../../api/client';

type Props = NativeStackScreenProps<AppStackParamList, 'RequestSwap'>;

const SLOTS = [
  { p: 1, n: 'Budi', d: 'Mar', past: true },
  { p: 2, n: 'Sari', d: 'Apr', past: true },
  { p: 3, n: 'Maya', d: 'Mei', past: true },
  { p: 4, n: 'Andi', d: 'Jun', current: true },
  { p: 5, n: 'Eka', d: 'Jul' },
  { p: 6, n: 'Fajar', d: 'Agu' },
  { p: 7, n: 'Gita', d: 'Sep' },
  { p: 8, n: 'Rina (kamu)', d: 'Okt', me: true },
  { p: 9, n: 'Doni', d: 'Nov' },
];

export function RequestSwapScreen({ navigation, route }: Props) {
  const { groupId, myPeriod } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [target, setTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const targetSlot = SLOTS.find((s) => s.p === target);
  const mySlot = SLOTS.find((s) => s.me);

  const handleSend = async () => {
    if (!token || !target) return;
    setLoading(true);
    try {
      const res: any = await apiCall(`/api/groups/${groupId}/swaps`, {
        method: 'POST',
        body: JSON.stringify({ my_period: myPeriod, target_period: target }),
        token,
      });
      navigation.navigate('SwapStatus', { requestId: res.id ?? 'new' });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Tukar Giliran" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.infoBox}>
          <Icon name="info" size={19} color={Colors.primaryInk} />
          <Text style={styles.infoText}>
            Giliranmu <Text style={styles.bold}>periode {myPeriod}</Text>. Tap periode lain untuk ajukan tukar.
          </Text>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {SLOTS.map((s) => {
            const isTarget = s.p === target;
            return (
              <TouchableOpacity
                key={s.p}
                onPress={() => !s.past && !s.me && !s.current && setTarget(s.p)}
                disabled={s.past || s.me || s.current}
                style={[
                  styles.slot,
                  s.me && styles.slotMe,
                  isTarget && styles.slotTarget,
                  s.past && styles.slotPast,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.slotNum, s.current && styles.slotNumCurrent]}>
                  <Text style={[styles.slotNumText, s.current && styles.slotNumTextCurrent]}>
                    {s.p}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.slotName}>{s.n}</Text>
                  <Text style={styles.slotDate}>Periode {s.p} · {s.d} 2026</Text>
                </View>
                {s.me && <Pill tone="mint">Posisimu</Pill>}
                {isTarget && <Pill tone="amber">Tukar ke sini</Pill>}
                {s.current && <Pill tone="solid">Sekarang</Pill>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.flex} />
        <Btn
          full size="lg" icon="swap"
          onPress={handleSend}
          disabled={!target || !isOnline}
          loading={loading}
          style={styles.cta}
        >
          {target ? `Kirim request: P${myPeriod} ↔ P${target} (${targetSlot?.n ?? ''})` : 'Pilih periode tujuan'}
        </Btn>
        {!isOnline && <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: Colors.primaryTint, borderRadius: 16, padding: 14, marginBottom: 16 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  bold: { fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  timeline: { position: 'relative', gap: 9 },
  timelineLine: { position: 'absolute', left: 19, top: 14, bottom: 14, width: 2, backgroundColor: Colors.border, zIndex: 0 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent', position: 'relative', zIndex: 1 },
  slotMe: { backgroundColor: Colors.primaryTint, borderColor: Colors.primary, borderStyle: 'dashed' },
  slotTarget: { backgroundColor: Colors.amberTint, borderColor: Colors.amber, borderStyle: 'dashed' },
  slotPast: { opacity: 0.5 },
  slotNum: { width: 38, height: 38, borderRadius: 19, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.card, zIndex: 1 },
  slotNumCurrent: { backgroundColor: Colors.primary, borderWidth: 0 },
  slotNumText: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.ink, fontWeight: '600' },
  slotNumTextCurrent: { color: Colors.white },
  slotName: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink, fontWeight: '600' },
  slotDate: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  cta: { marginTop: 22 },
  offlineNote: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8 },
});
