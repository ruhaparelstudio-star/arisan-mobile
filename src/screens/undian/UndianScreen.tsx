import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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
import { LoadingView } from '../../components/ui/LoadingView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { apiCall } from '../../api/client';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianPre'>;

const MOCK_CANDIDATES = ['Rina', 'Sari', 'Andi', 'Maya', 'Doni', 'Eka', 'Gita', 'Hana', 'Ika'];

export function UndianScreen({ navigation, route }: Props) {
  const { groupId, periodId, periodNumber } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!isOnline || !token) return;
    setLoading(true);
    try {
      const result: any = await apiCall(`/api/groups/${groupId}/periods/${periodId}/draw`, {
        method: 'POST', token,
      });
      navigation.replace('UndianResult', {
        groupId, periodId,
        winnerName: result.winner_name ?? 'Pemenang',
        winnerAmount: result.winner_amount ?? 0,
      });
    } catch (e: any) {
      navigation.navigate('UndianError', { groupId, periodId, periodNumber });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingView
          icon="sparkles"
          title="Server sedang mengundi"
          sub="Hasil acak & adil — disiarkan ke semua anggota"
          cycle={MOCK_CANDIDATES}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <Pill tone="mint" dot style={styles.livePill}>
          Live · anggota akan menonton
        </Pill>
        <Text style={styles.h1}>Siap mengundi pemenang periode {periodNumber}?</Text>
        <Text style={styles.sub}>
          Hanya anggota yang belum pernah menang yang diundi. Hasil diproses server — adil & tidak bisa diubah.
        </Text>

        <Card style={styles.candidatesCard}>
          <SectionLabel>Calon pemenang · {MOCK_CANDIDATES.length} orang</SectionLabel>
          <View style={styles.grid}>
            {MOCK_CANDIDATES.map((n, i) => (
              <View key={i} style={styles.candidateCard}>
                <Avatar name={n} size={40} />
                <Text style={styles.candidateName}>{n}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.infoBox}>
          <Icon name="shield" size={20} color={Colors.primaryInk} />
          <Text style={styles.infoText}>
            Hasil otomatis disiarkan ke chat grup & semua anggota dapat notifikasi.
          </Text>
        </View>

        <View style={styles.flex} />
        <Btn
          full size="lg" icon="sparkles"
          onPress={handleStart}
          disabled={!isOnline}
          style={styles.cta}
        >
          Mulai Undian
        </Btn>
        {!isOnline && (
          <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  livePill: { marginBottom: 14 },
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 25, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21, marginTop: 10 },
  candidatesCard: { marginTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  candidateCard: { width: '30%', aspectRatio: 3 / 4, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8 },
  candidateName: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: Colors.primaryTint, borderRadius: 16, padding: 14, marginTop: 14 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  cta: { marginTop: 24 },
  offlineNote: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8 },
});
