import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, GroupDetail, GroupMember } from '../../api/groups';
import { swapsApi } from '../../api/swaps';
import { undianApi } from '../../api/undian';

type Props = NativeStackScreenProps<AppStackParamList, 'RequestSwap'>;

export function RequestSwapScreen({ navigation, route }: Props) {
  const { groupId, myPeriod } = route.params;
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [winnerIds, setWinnerIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [target, setTarget] = useState<GroupMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setErrorMsg('');
    try {
      const [data, undianRes] = await Promise.all([
        getGroupDetail(token, groupId),
        undianApi.getHistory(groupId, token).catch(() => ({ winners: [] })),
      ]);
      setGroup(data);
      setWinnerIds(new Set(undianRes.winners.map((w) => w.user_id)));
    } catch {
      setErrorMsg('Gagal memuat data anggota. Coba lagi.');
    } finally {
      setLoadingData(false);
    }
  }, [token, groupId]);

  useEffect(() => { load(); }, [load]);

  const myUserId = user?.id ?? '';

  const members = group
    ? [...group.members].sort((a, b) => {
        if (a.slot_order === null) return 1;
        if (b.slot_order === null) return -1;
        return a.slot_order - b.slot_order;
      })
    : [];

  const currentPeriod = group?.current_period ?? 0;
  const mySwapCount = group?.members.find((m) => m.user_id === myUserId)?.swap_count ?? 0;
  const swapLimitReached = mySwapCount >= 2;

  const handleSend = async () => {
    if (!token || !target) return;
    setSubmitting(true);
    try {
      const swap = await swapsApi.request(target.user_id, groupId, token);
      navigation.replace('SwapStatus', { requestId: swap.id });
    } catch (e: any) {
      Alert.alert('Gagal Mengirim', e?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Tukar Giliran" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Tukar Giliran" onBack={() => navigation.goBack()} />
        <StateView
          icon="alert"
          tone="danger"
          title="Gagal Memuat"
          body={errorMsg}
          primary="Coba Lagi"
          onPrimary={load}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Tukar Giliran" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.infoBox}>
          <Icon name="info" size={19} color={Colors.primaryInk} />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Giliranmu <Text style={styles.bold}>periode {myPeriod}</Text>. Pilih anggota untuk ajukan tukar giliran.
            </Text>
            {group && (() => {
              const me = group.members.find((m) => m.user_id === myUserId);
              if (!me) return null;
              const MAX_SWAP = 2;
              const used = me.swap_count ?? 0;
              const remaining = MAX_SWAP - used;
              return (
                <Text style={[styles.swapQuota, remaining <= 0 && styles.swapQuotaEmpty]}>
                  Sisa batas tukar: {remaining}/{MAX_SWAP}
                  {remaining <= 0 ? ' — Batas tercapai' : ''}
                </Text>
              );
            })()}
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {members.map((m) => {
            const isMe = m.user_id === user?.id;
            const noSlot = m.slot_order === null && !isMe;
            const slot = m.slot_order ?? 0;
            const isPast = slot < currentPeriod && !isMe && !noSlot;
            const isCurrent = slot === currentPeriod && !isMe && !noSlot;
            const hasWon = winnerIds.has(m.user_id) && !isMe;
            const isTarget = target?.user_id === m.user_id;
            const disabled = isPast || isMe || isCurrent || noSlot || hasWon;
            return (
              <TouchableOpacity
                key={m.user_id}
                onPress={() => {
                  if (hasWon) {
                    Alert.alert('Tidak Bisa Tukar', `${m.user.name ?? m.user.phone} sudah pernah memenangkan undian dan menerima uang arisan. Tukar giliran dengan anggota yang belum menang.`);
                    return;
                  }
                  if (!disabled) setTarget(isTarget ? null : m);
                }}
                disabled={disabled && !hasWon}
                style={[
                  styles.slot,
                  isMe && styles.slotMe,
                  isTarget && styles.slotTarget,
                  disabled && !isMe && styles.slotDisabled,
                  hasWon && styles.slotWon,
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.slotNum, isCurrent && styles.slotNumCurrent, hasWon && styles.slotNumWon]}>
                  <Text style={[styles.slotNumText, isCurrent && styles.slotNumTextCurrent]}>
                    {noSlot ? '?' : slot}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.slotName}>
                    {m.user.name ?? m.user.phone}
                    {isMe ? ' (kamu)' : ''}
                  </Text>
                  <Text style={styles.slotDate}>{noSlot ? 'Belum ada giliran' : `Periode ${slot}`}</Text>
                </View>
                {isMe && <Pill tone="mint">Posisimu</Pill>}
                {isTarget && <Pill tone="amber">Tukar ke sini</Pill>}
                {isCurrent && !hasWon && <Pill tone="solid">Sekarang</Pill>}
                {isPast && !hasWon && <Pill tone="neutral">Selesai</Pill>}
                {hasWon && <Pill tone="mint">Sudah Menang</Pill>}
                {noSlot && <Pill tone="neutral">Belum diatur</Pill>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Btn
          full
          size="lg"
          icon="swap"
          onPress={handleSend}
          disabled={!target || !isOnline || submitting || swapLimitReached}
          loading={submitting}
          style={styles.cta}
        >
          {target
            ? `Kirim request: P${myPeriod} ↔ P${target.slot_order} (${target.user.name ?? target.user.phone})`
            : 'Pilih anggota tujuan'}
        </Btn>
        {swapLimitReached && (
          <Text style={styles.offlineNote}>Batas tukar giliran (2×) sudah tercapai untuk grup ini</Text>
        )}
        {!isOnline && !swapLimitReached && (
          <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: Colors.primaryTint,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoContent: { flex: 1 },
  infoText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12.5,
    color: Colors.primaryInk,
    lineHeight: 19,
  },
  bold: { fontFamily: Fonts.bodySemiBold, fontWeight: '600' },
  swapQuota: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11.5,
    color: Colors.primaryInk,
    fontWeight: '600',
    marginTop: 5,
  },
  swapQuotaEmpty: { color: Colors.danger },
  timeline: { position: 'relative', gap: 9 },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 14,
    bottom: 14,
    width: 2,
    backgroundColor: Colors.border,
    zIndex: 0,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  slotMe: {
    backgroundColor: Colors.primaryTint,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  slotTarget: {
    backgroundColor: Colors.amberTint,
    borderColor: Colors.amber,
    borderStyle: 'dashed',
  },
  slotDisabled: { opacity: 0.45 },
  slotWon: { backgroundColor: Colors.primaryTint, opacity: 0.7 },
  slotNumWon: { borderColor: Colors.primary, backgroundColor: Colors.primaryTint },
  slotNum: {
    width: 38,
    height: 38,
    borderRadius: 19,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    zIndex: 1,
  },
  slotNumCurrent: { backgroundColor: Colors.primary, borderWidth: 0 },
  slotNumText: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
  },
  slotNumTextCurrent: { color: Colors.white },
  slotName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '600',
  },
  slotDate: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  cta: { marginTop: 22 },
  offlineNote: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
});
