import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
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
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { swapsApi, Swap } from '../../api/swaps';

type Props = NativeStackScreenProps<AppStackParamList, 'SwapStatus'>;

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusLabel(s: Swap['status']): string {
  switch (s) {
    case 'pending': return 'Menunggu Target';
    case 'waiting_ketua': return 'Menunggu Ketua';
    case 'approved': return 'Disetujui';
    case 'target_rejected': return 'Ditolak Target';
    case 'ketua_rejected': return 'Ditolak Ketua';
    default: return s;
  }
}

function statusTone(s: Swap['status']): 'mint' | 'amber' | 'danger' | 'neutral' {
  if (s === 'approved') return 'mint';
  if (s === 'target_rejected' || s === 'ketua_rejected') return 'danger';
  if (s === 'waiting_ketua') return 'amber';
  return 'neutral';
}

interface Step {
  label: string;
  sub: string;
  done: boolean;
  current: boolean;
  rejected?: boolean;
}

function buildSteps(swap: Swap): Step[] {
  const isRejected = swap.status === 'target_rejected' || swap.status === 'ketua_rejected';
  const targetResponded = swap.status !== 'pending';
  const ketuaApproved = swap.status === 'approved';
  const ketuaActed = swap.status === 'approved' || swap.status === 'ketua_rejected';

  return [
    {
      label: 'Request dibuat',
      sub: fmtDate(swap.created_at),
      done: true,
      current: false,
    },
    {
      label: 'Target menyetujui',
      sub: swap.status === 'target_rejected'
        ? '✕ Ditolak oleh target'
        : targetResponded
        ? '✓ Disetujui'
        : 'Menunggu konfirmasi target',
      done: targetResponded && swap.status !== 'target_rejected',
      current: swap.status === 'pending',
      rejected: swap.status === 'target_rejected',
    },
    {
      label: 'Ketua approve final',
      sub: swap.status === 'ketua_rejected'
        ? '✕ Ditolak oleh ketua'
        : ketuaApproved
        ? '✓ Disetujui'
        : isRejected
        ? 'Tidak berlaku'
        : 'Menunggu approval ketua',
      done: ketuaApproved,
      current: swap.status === 'waiting_ketua',
      rejected: swap.status === 'ketua_rejected',
    },
    {
      label: 'Urutan ter-update',
      sub: ketuaApproved ? '✓ Urutan sudah diperbarui' : 'Otomatis setelah approve',
      done: ketuaApproved,
      current: false,
    },
  ];
}

export function SwapStatusScreen({ navigation, route }: Props) {
  const { requestId } = route.params;
  const { token, user } = useAuth();
  const [swap, setSwap] = useState<Swap | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      const res = await swapsApi.getMySwaps(token);
      const found = res.swaps.find((s) => s.id === requestId) ?? null;
      setSwap(found);
      setError(found ? null : 'Request tukar tidak ditemukan.');
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat status tukar.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, requestId]);

  useEffect(() => { load(); }, [load]);

  const requesterName = swap?.requester?.name ?? swap?.requester?.phone ?? 'Kamu';
  const targetName = swap?.target?.name ?? swap?.target?.phone ?? 'Target';
  const isRequester = !!user && swap?.requester_id === user.id;

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Status Tukar" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !swap) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Status Tukar" onBack={() => navigation.goBack()} />
        <StateView
          icon="alert"
          tone="danger"
          title="Gagal Memuat"
          body={error ?? 'Request tidak ditemukan.'}
          primary="Coba Lagi"
          onPrimary={() => { setLoading(true); load(); }}
        />
      </SafeAreaView>
    );
  }

  const steps = buildSteps(swap);
  const tone = statusTone(swap.status);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Status Tukar" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <View>
          <Card tint accent pad={18}>
            <View style={styles.statusRow}>
              <Pill tone={tone}>
                {statusLabel(swap.status)}
              </Pill>
            </View>
            <View style={styles.swapRow}>
              <View style={styles.swapParty}>
                <Avatar name={requesterName} size={50} mint={isRequester} />
                <Text style={styles.partyName}>
                  {isRequester ? `${requesterName} (kamu)` : requesterName}
                </Text>
              </View>
              <Icon name="swap" size={28} color={Colors.primaryInk} />
              <View style={styles.swapParty}>
                <Avatar name={targetName} size={50} />
                <Text style={styles.partyName}>{targetName}</Text>
              </View>
            </View>
          </Card>

          <View style={styles.stepsSection}>
            <SectionLabel>Progress 3 langkah</SectionLabel>
            <View style={styles.steps}>
              <View style={styles.stepsLine} />
              {steps.map((st, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[
                    styles.stepCircle,
                    st.done && styles.stepDone,
                    st.current && styles.stepCurrent,
                    st.rejected && styles.stepRejected,
                  ]}>
                    {st.done ? (
                      <Icon name="check" size={14} color={Colors.white} strokeWidth={3} />
                    ) : st.rejected ? (
                      <Icon name="x" size={14} color={Colors.danger} strokeWidth={2.5} />
                    ) : st.current ? (
                      <Icon name="clock" size={14} color={Colors.amberInk} />
                    ) : (
                      <Text style={styles.stepNum}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[
                      styles.stepLabel,
                      (st.done || st.current) && styles.stepLabelActive,
                      st.current && styles.stepLabelCurrent,
                      st.rejected && styles.stepLabelRejected,
                    ]}>
                      {st.label}
                    </Text>
                    <Text style={[styles.stepSub, st.rejected && styles.stepSubRejected]}>
                      {st.sub}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Btn variant="outline" size="lg" onPress={() => navigation.goBack()} style={styles.backBtn}>
          Kembali
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  statusRow: { alignItems: 'center', marginBottom: 16 },
  swapRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  swapParty: { alignItems: 'center', gap: 6 },
  partyName: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink, fontWeight: '600', textAlign: 'center', maxWidth: 100 },
  stepsSection: { marginTop: 22 },
  steps: { position: 'relative', paddingLeft: 4, gap: 16 },
  stepsLine: { position: 'absolute', left: 16, top: 16, bottom: 16, width: 2, backgroundColor: Colors.border },
  stepRow: { flexDirection: 'row', gap: 14, position: 'relative' },
  stepCircle: { width: 26, height: 26, borderRadius: 13, flexShrink: 0, alignItems: 'center', justifyContent: 'center', zIndex: 1, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.card },
  stepDone: { backgroundColor: Colors.primary, borderWidth: 0 },
  stepCurrent: { backgroundColor: Colors.amberTint, borderColor: Colors.amber },
  stepRejected: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  stepNum: { fontFamily: Fonts.displaySemiBold, fontSize: 12, color: Colors.muted, fontWeight: '600' },
  stepContent: { flex: 1, paddingTop: 2 },
  stepLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.muted, fontWeight: '600' },
  stepLabelActive: { color: Colors.ink },
  stepLabelCurrent: { fontFamily: Fonts.bodyBold, fontWeight: '700' },
  stepLabelRejected: { color: Colors.danger },
  stepSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 1 },
  stepSubRejected: { color: Colors.danger },
  backBtn: { marginTop: 22 },
});
