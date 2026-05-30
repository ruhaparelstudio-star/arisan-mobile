import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentHistory'>;

const MOCK_PERIODS = [
  { num: 3, winner: 'Maya', paid: 12, total: 12, status: 'closed' },
  { num: 2, winner: 'Sari', paid: 12, total: 12, status: 'closed' },
  { num: 1, winner: 'Budi', paid: 12, total: 12, status: 'closed' },
];

export function PaymentHistoryScreen({ navigation, route }: Props) {
  const { groupName } = route.params;
  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Riwayat Pembayaran" sub={groupName} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        {MOCK_PERIODS.map((p) => (
          <Card key={p.num} style={styles.card}>
            <View style={styles.periodHeader}>
              <Text style={styles.periodTitle}>Periode {p.num}</Text>
              <Pill tone={p.status === 'closed' ? 'mint' : 'amber'} dot>
                {p.status === 'closed' ? 'Selesai' : 'Aktif'}
              </Pill>
            </View>
            <View style={styles.winnerRow}>
              <Avatar name={p.winner} size={28} />
              <Text style={styles.winnerText}>Pemenang: {p.winner}</Text>
            </View>
            <View style={styles.progressRow}>
              <Icon name="wallet" size={15} color={Colors.primary} />
              <Text style={styles.progressText}>{p.paid}/{p.total} anggota lunas</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
  card: { marginBottom: 12 },
  periodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  periodTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 17, color: Colors.ink, fontWeight: '600' },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  winnerText: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.ink, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressText: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted },
});
