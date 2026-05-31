import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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
import { LoadingView } from '../../components/ui/LoadingView';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail } from '../../api/groups';
import { undianApi } from '../../api/undian';

type Props = NativeStackScreenProps<AppStackParamList, 'UndianPre'>;

interface Candidate {
  id: string;
  name: string;
}

export function UndianScreen({ navigation, route }: Props) {
  const { groupId, periodId, periodNumber, isKetua } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [drawMode, setDrawMode] = useState<'fixed' | 'random' | 'manual'>('random');
  const [ketuaId, setKetuaId] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setLoadError(null);
    try {
      const [group, historyRes] = await Promise.all([
        getGroupDetail(token, groupId),
        undianApi.getHistory(groupId, token),
      ]);
      const wonIds = new Set(historyRes.winners.map((w) => w.user_id));
      const cands = group.members
        .filter((m) => !wonIds.has(m.user_id))
        .map((m) => ({ id: m.user_id, name: m.user.name ?? m.user.phone }));
      setCandidates(cands);
      setDrawMode((group.draw_mode ?? 'random') as 'fixed' | 'random' | 'manual');
      setKetuaId(group.created_by ?? '');
    } catch (e: any) {
      setLoadError(e.message ?? 'Gagal memuat data undian. Coba lagi.');
    } finally {
      setLoadingData(false);
    }
  }, [groupId, token]);

  useEffect(() => { load(); }, [load]);

  const handleStart = async () => {
    if (!isOnline || !token) return;
    setRunning(true);
    try {
      const result = await undianApi.start(groupId, drawMode, periodId, undefined, token);
      navigation.replace('UndianResult', {
        groupId,
        periodId,
        winnerName: result.winner.name,
        winnerAmount: 0,
        periodeKe: result.periode_ke,
        ketuaId,
      });
    } catch (e: any) {
      Alert.alert('Undian Gagal', e.message ?? 'Gagal menjalankan undian. Coba lagi.');
    } finally {
      setRunning(false);
    }
  };

  if (running) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <LoadingView
          icon="sparkles"
          title="Sedang mengundi..."
          sub="Hasil acak & adil — disiarkan ke semua anggota"
          cycle={candidates.map((c) => c.name)}
        />
      </SafeAreaView>
    );
  }

  if (loadingData) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
        <LoadingView icon="sparkles" title="Memuat data undian..." />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
        <StateView
          icon="sparkles"
          tone="danger"
          title="Gagal memuat"
          body={loadError}
          primary="Coba Lagi"
          onPrimary={load}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title={`Undian Periode ${periodNumber}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          {isKetua && (
            <Pill tone="mint" dot style={styles.livePill}>
              Live · anggota akan menonton
            </Pill>
          )}

          <Text style={styles.h1}>
            {isKetua
              ? `Siap mengundi pemenang periode ${periodNumber}?`
              : `Undian Periode ${periodNumber}`}
          </Text>
          <Text style={styles.sub}>
            {isKetua
              ? 'Hanya anggota yang belum pernah menang yang diundi. Hasil diproses server — adil & tidak bisa diubah.'
              : 'Berikut anggota yang belum mendapat giliran menerima arisan.'}
          </Text>

          <Card style={styles.candidatesCard}>
            <SectionLabel>
              {candidates.length > 0
                ? `Belum mendapat giliran · ${candidates.length} orang`
                : 'Semua anggota sudah mendapat giliran'}
            </SectionLabel>
            {candidates.length === 0 ? (
              <View style={styles.emptyRow}>
                <Icon name="checkCircle" size={20} color={Colors.primary} />
                <Text style={styles.emptyText}>Semua anggota sudah pernah menang</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {candidates.map((c) => (
                  <View key={c.id} style={styles.candidateCard}>
                    <Avatar name={c.name} size={40} />
                    <Text style={styles.candidateName} numberOfLines={1}>{c.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {isKetua && (
            <View style={styles.infoBox}>
              <Icon name="shield" size={20} color={Colors.primaryInk} />
              <Text style={styles.infoText}>
                Hasil otomatis disiarkan ke chat grup & semua anggota dapat notifikasi.
              </Text>
            </View>
          )}
        </View>

        {isKetua && (
          <View>
            <Btn
              full size="lg" icon="sparkles"
              onPress={handleStart}
              disabled={!isOnline || candidates.length === 0}
              style={styles.cta}
            >
              Mulai Undian
            </Btn>
            {!isOnline && (
              <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  livePill: { marginBottom: 14 },
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 25, lineHeight: 29, color: Colors.ink, letterSpacing: -0.5, fontWeight: '600' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21, marginTop: 10 },
  candidatesCard: { marginTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  candidateCard: { width: '30%', aspectRatio: 3 / 4, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', gap: 8 },
  candidateName: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: Colors.primaryTint, borderRadius: 16, padding: 14, marginTop: 14 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 19 },
  cta: { marginTop: 24 },
  offlineNote: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8 },
});
