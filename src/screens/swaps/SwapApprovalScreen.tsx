import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { swapsApi, Swap } from '../../api/swaps';

type Props = NativeStackScreenProps<AppStackParamList, 'SwapApproval'>;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function SwapApprovalScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();

  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');
    try {
      const res = await swapsApi.getGroupSwaps(groupId, token);
      const pending = res.swaps.filter((s) => s.status === 'target_accepted');
      setSwaps(pending);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Gagal memuat daftar approval. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, groupId]);

  useEffect(() => { load(); }, [load]);

  const handleDecide = (swap: Swap, decision: 'approved' | 'ketua_rejected') => {
    if (!isOnline) {
      Alert.alert('Offline', 'Butuh koneksi internet untuk melakukan aksi ini.');
      return;
    }
    const requesterName = swap.requester?.name ?? swap.requester?.phone ?? 'Anggota';
    const targetName = swap.target?.name ?? swap.target?.phone ?? 'Anggota';
    const label = decision === 'approved' ? 'Setujui' : 'Tolak';
    Alert.alert(
      `${label} Tukar Giliran?`,
      `${requesterName} (P${swap.requester_period ?? '?'}) ↔ ${targetName} (P${swap.target_period ?? '?'})\n\nUrutan giliran akan berubah setelah disetujui.`,
      [
        {
          text: label,
          style: decision === 'ketua_rejected' ? 'destructive' : 'default',
          onPress: () => doDecide(swap.id, decision),
        },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  };

  const doDecide = async (swapId: string, decision: 'approved' | 'ketua_rejected') => {
    if (!token) return;
    setActionId(swapId);
    try {
      await swapsApi.approve(swapId, decision, token);
      const label = decision === 'approved' ? 'disetujui' : 'ditolak';
      Alert.alert('Berhasil', `Tukar giliran telah ${label}. Urutan giliran akan diperbarui.`);
      await load();
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBar title="Approval Tukar Giliran" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBar title="Approval Tukar Giliran" onBack={() => navigation.goBack()} />
        <StateView
          icon="alert"
          tone="danger"
          title="Gagal Memuat"
          body={errorMsg}
          primary="Coba Lagi"
          onPrimary={() => load()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Approval Tukar Giliran" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={swaps.length === 0 ? styles.emptyScroll : styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={Colors.primary}
          />
        }
      >
        {swaps.length === 0 ? (
          <StateView
            icon="check"
            tone="mint"
            title="Semua Beres"
            body={`Tidak ada tukar giliran yang menunggu approval di ${groupName}.`}
          />
        ) : (
          <>
            <Text style={styles.hint}>
              {swaps.length} permintaan tukar giliran menunggu persetujuanmu.
            </Text>
            {swaps.map((s) => {
              const requesterName = s.requester?.name ?? s.requester?.phone ?? 'Anggota';
              const targetName = s.target?.name ?? s.target?.phone ?? 'Anggota';
              const isActing = actionId === s.id;
              return (
                <Card key={s.id} style={styles.card}>
                  <View style={styles.partiesRow}>
                    <View style={styles.party}>
                      <Avatar name={requesterName} size={40} mint />
                      <Text style={styles.partyName} numberOfLines={1}>
                        {requesterName}
                      </Text>
                      {s.requester_period != null && <Pill tone="neutral">P{s.requester_period}</Pill>}
                    </View>

                    <View style={styles.swapCenter}>
                      <Icon name="swap" size={22} color={Colors.primaryInk} />
                      <Text style={styles.swapLabel}>Tukar</Text>
                    </View>

                    <View style={styles.party}>
                      <Avatar name={targetName} size={40} />
                      <Text style={styles.partyName} numberOfLines={1}>
                        {targetName}
                      </Text>
                      {s.target_period != null && <Pill tone="mint">P{s.target_period}</Pill>}
                    </View>
                  </View>

                  <Text style={styles.dateSub}>
                    Target sudah menyetujui · Diajukan {fmtDate(s.created_at)}
                  </Text>

                  {isActing ? (
                    <View style={styles.actingRow}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={styles.actingText}>Memproses...</Text>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleDecide(s, 'ketua_rejected')}
                        disabled={!isOnline}
                      >
                        <Icon name="x" size={15} color={Colors.danger} />
                        <Text style={styles.rejectText}>Tolak</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleDecide(s, 'approved')}
                        disabled={!isOnline}
                      >
                        <Icon name="check" size={15} color={Colors.white} strokeWidth={2.5} />
                        <Text style={styles.approveText}>Setujui</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {!isOnline && (
                    <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 12 },
  emptyScroll: { flex: 1 },
  hint: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 4,
  },
  card: { marginBottom: 0 },
  partiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  party: { alignItems: 'center', gap: 6, flex: 1 },
  partyName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '600',
    maxWidth: 90,
    textAlign: 'center',
  },
  swapCenter: { alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  swapLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: Colors.muted,
  },
  dateSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11.5,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  actingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  actingText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: Colors.muted,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: Colors.dangerTint,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  approveBtn: { backgroundColor: Colors.primary },
  rejectText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600',
  },
  approveText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  offlineNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11.5,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
});
