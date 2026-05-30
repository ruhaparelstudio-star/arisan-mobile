import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
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
import { OfflineBanner } from '../../components/OfflineBanner';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { usePaymentRealtime } from '../../hooks/usePaymentRealtime';
import { confirmPayments } from '../../api/payments';

type Props = NativeStackScreenProps<AppStackParamList, 'Bayar'>;

const MOCK_UNPAID = [
  { id: 'u1', name: 'Andi Pratama', sub: 'Slot urutan #3', late: false },
  { id: 'u2', name: 'Maya Sari', sub: '⚠ Terlambat 3 hari', late: true },
  { id: 'u3', name: 'Eka Wijaya', sub: 'Slot urutan #9', late: false },
  { id: 'u4', name: 'Citra Dewi', sub: 'Slot urutan #6', late: false },
  { id: 'u5', name: 'Fajar Nugroho', sub: 'Slot urutan #10', late: false },
];

export function PaymentStatusScreen({ navigation, route }: Props) {
  const { groupId, periodId, periodNumber } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  usePaymentRealtime(groupId, () => {});

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!token || selected.size === 0) return;
    setLoading(true);
    try {
      await confirmPayments(token, groupId, periodId, [...selected]);
      const names = MOCK_UNPAID.filter((u) => selected.has(u.id)).map((u) => u.name);
      navigation.navigate('BayarDone', { confirmedNames: names, amount: selected.size * 500000 });
    } catch (e: any) {
      // show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Konfirmasi Bayar" sub={`Periode ${periodNumber} · pilih lalu konfirmasi`} onBack={() => navigation.goBack()} />
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Pill tone="amber" dot>{MOCK_UNPAID.length} belum bayar</Pill>
          <Text style={styles.selectAll} onPress={() => setSelected(new Set(MOCK_UNPAID.map((u) => u.id)))}>
            Pilih semua
          </Text>
        </View>
        <Card pad={6}>
          {MOCK_UNPAID.map((m, i) => {
            const on = selected.has(m.id);
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => toggle(m.id)}
                style={[styles.memberRow, i < MOCK_UNPAID.length - 1 && styles.memberBorder, on && styles.memberRowSelected]}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, on && styles.checkboxSelected]}>
                  {on && <Icon name="check" size={14} color={Colors.white} strokeWidth={3} />}
                </View>
                <Avatar name={m.name} size={38} />
                <View style={styles.flex}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={[styles.memberSub, m.late && styles.memberSubLate]}>{m.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>

        <View style={styles.auditNote}>
          <Icon name="lock" size={18} color={Colors.muted} />
          <Text style={styles.auditText}>
            Tiap konfirmasi tercatat: <Text style={styles.auditBold}>"oleh Ketua · {'{waktu}'}"</Text> dan terlihat semua anggota.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.stickyBottom}>
        <View style={styles.flex}>
          <Text style={styles.selectedCount}>{selected.size} dipilih · total</Text>
          <Text style={styles.totalAmount}>Rp {(selected.size * 500000).toLocaleString('id')}</Text>
        </View>
        <Btn
          size="lg"
          icon="check"
          onPress={handleConfirm}
          disabled={selected.size === 0 || !isOnline}
          loading={loading}
        >
          Konfirmasi {selected.size > 0 ? selected.size : ''}
        </Btn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 12 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectAll: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.primaryInk, fontWeight: '600' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 0 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberRowSelected: { backgroundColor: Colors.primaryTint, borderRadius: 12, margin: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  memberName: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  memberSub: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  memberSubLate: { color: Colors.danger },
  auditNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 13, marginTop: 14 },
  auditText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, lineHeight: 18 },
  auditBold: { fontFamily: Fonts.bodySemiBold, color: Colors.ink, fontWeight: '600' },
  stickyBottom: { flexShrink: 0, padding: 14, paddingHorizontal: 22, paddingBottom: 28, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bg, flexDirection: 'row', alignItems: 'center', gap: 14 },
  selectedCount: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  totalAmount: { fontFamily: Fonts.displaySemiBold, fontSize: 19, color: Colors.ink, fontWeight: '600' },
});
