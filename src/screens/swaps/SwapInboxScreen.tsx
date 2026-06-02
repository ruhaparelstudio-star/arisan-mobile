import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type Props = NativeStackScreenProps<AppStackParamList, 'SwapInbox'>;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function SwapInboxScreen({ navigation }: Props) {
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();

  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token || !user?.id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');
    try {
      const res = await swapsApi.getMySwaps(token);
      // 'pending' = normal swap, 'ketua_pending' = ketua inisiasi swap (perlu target accept)
      const incoming = res.swaps.filter(
        (s) => s.target_id === user?.id && (s.status === 'pending' || s.status === 'ketua_pending'),
      );
      setSwaps(incoming);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Gagal memuat inbox. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleRespond = (swap: Swap) => {
    if (!isOnline) {
      Alert.alert('Offline', 'Butuh koneksi internet untuk melakukan aksi ini.');
      return;
    }
    const requesterName = swap.requester?.name ?? swap.requester?.phone ?? 'Anggota';
    Alert.alert(
      'Permintaan Tukar Giliran',
      `${requesterName} ingin tukar giliran dengan kamu.`,
      [
        {
          text: 'Terima',
          onPress: () => doRespond(swap.id, 'accepted'),
        },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: () => doRespond(swap.id, 'rejected'),
        },
        { text: 'Batal', style: 'cancel' },
      ],
    );
  };

  const doRespond = async (swapId: string, response: 'accepted' | 'rejected') => {
    if (!token) return;
    setActionId(swapId);
    try {
      await swapsApi.respond(swapId, response, token);
      const label = response === 'accepted' ? 'diterima' : 'ditolak';
      Alert.alert('Berhasil', `Permintaan tukar giliran telah ${label}.`);
      await load();
    } catch (e: any) {
      Alert.alert('Gagal', e?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Inbox Tukar Giliran" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Inbox Tukar Giliran" onBack={() => navigation.goBack()} />
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
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Inbox Tukar Giliran" onBack={() => navigation.goBack()} />
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
            icon="swap"
            tone="mint"
            title="Tidak Ada Request Masuk"
            body="Belum ada anggota yang mengajukan tukar giliran denganmu."
          />
        ) : (
          <>
            <Text style={styles.hint}>
              {swaps.length} permintaan masuk menunggu responsmu.
            </Text>
            {swaps.map((s) => {
              const name = s.requester?.name ?? s.requester?.phone ?? 'Anggota';
              const isActing = actionId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => !isActing && handleRespond(s)}
                  activeOpacity={0.75}
                >
                  <Card style={styles.card}>
                    <View style={styles.row}>
                      <Avatar name={name} size={44} />
                      <View style={styles.info}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{name}</Text>
                          {s.status === 'ketua_pending' && (
                            <Pill tone="amber">Dari Ketua</Pill>
                          )}
                        </View>
                        <Text style={styles.sub}>Dikirim {fmtDate(s.created_at)}</Text>
                      </View>
                      {isActing ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Icon name="chevronRight" size={20} color={Colors.muted} />
                      )}
                    </View>

                    <View style={styles.swapRow}>
                      <View style={styles.periodBox}>
                        <Text style={styles.periodLabel}>Giliran mereka</Text>
                        {s.requester_period != null
                          ? <Pill tone="neutral">Periode {s.requester_period}</Pill>
                          : <Text style={styles.periodLabel}>—</Text>}
                      </View>
                      <Icon name="swap" size={20} color={Colors.primaryInk} />
                      <View style={styles.periodBox}>
                        <Text style={styles.periodLabel}>Giliranmu</Text>
                        {s.target_period != null
                          ? <Pill tone="mint">Periode {s.target_period}</Pill>
                          : <Text style={styles.periodLabel}>—</Text>}
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => !isActing && doRespond(s.id, 'rejected')}
                        disabled={isActing || !isOnline}
                      >
                        <Icon name="x" size={15} color={Colors.danger} />
                        <Text style={styles.rejectText}>Tolak</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => !isActing && doRespond(s.id, 'accepted')}
                        disabled={isActing || !isOnline}
                      >
                        <Icon name="check" size={15} color={Colors.white} strokeWidth={2.5} />
                        <Text style={styles.acceptText}>Terima</Text>
                      </TouchableOpacity>
                    </View>
                    {!isOnline && (
                      <Text style={styles.offlineNote}>Butuh koneksi internet untuk merespons</Text>
                    )}
                  </Card>
                </TouchableOpacity>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  info: { flex: 1 },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.ink,
    fontWeight: '600',
  },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 2 },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  periodBox: { alignItems: 'center', gap: 6 },
  periodLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11.5,
    color: Colors.muted,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
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
  acceptBtn: { backgroundColor: Colors.primary },
  rejectText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600',
  },
  acceptText: {
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
