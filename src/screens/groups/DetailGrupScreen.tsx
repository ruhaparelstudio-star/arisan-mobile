import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, Share, Clipboard, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { AnggotaItem } from '../../components/AnggotaItem';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SkeletonBar } from '../../components/ui/SkeletonBar';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, GroupDetail, generateInvite, leaveGroup, disbandGroup, setTanggalPelaksanaan, kickMember } from '../../api/groups';
import { getActivityLog, ActivityLogEntry } from '../../api/chat';
import { getPayments, getPeriods, Payment } from '../../api/payments';
import { undianApi } from '../../api/undian';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupDetail'>;

const QUICK_ACTIONS = [
  { icon: 'wallet', label: 'Bayar', primary: true, screen: 'Bayar' as const },
  { icon: 'message', label: 'Chat', screen: 'Chat' as const },
  { icon: 'swap', label: 'Tukar', screen: 'RequestSwap' as const },
  { icon: 'sparkles', label: 'Undian', screen: 'UndianPre' as const },
] as const;

const TONE_BG: Record<string, string> = {
  mint: '#E6FAF5',
  blue: '#EAF2FF',
  amber: '#FFF7E6',
  neutral: '#F8F8F8',
};
const TONE_FG: Record<string, string> = {
  mint: '#00A87E',
  blue: '#2D6FD6',
  amber: '#B45309',
  neutral: '#888888',
};

function fmtLastUpdated(d: Date): string {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ', ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: 'Mingguan',
  biweekly: '2 Minggu sekali',
  monthly: 'Bulanan',
};

const DRAW_MODE_LABEL: Record<string, string> = {
  random: 'Acak per periode',
  fixed: 'Urutan tetap',
  manual: 'Ketua tentukan',
};

export function DetailGrupScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isKetua = !!group && !!user && group.created_by === user.id;
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [showTanggalModal, setShowTanggalModal] = useState(false);
  const [tanggalInput, setTanggalInput] = useState('');
  const [tanggalLoading, setTanggalLoading] = useState(false);
  const [paymentStatusMap, setPaymentStatusMap] = useState<Record<string, 'lunas' | 'belum' | 'terlambat'>>({});
  const [paidCount, setPaidCount] = useState(0);
  const [currentPeriodDue, setCurrentPeriodDue] = useState<string | null>(null);
  const [currentWinnerName, setCurrentWinnerName] = useState<string | null>(null);
  // true jika sudah ada pemenang minimal 1x (enable Tukar)
  const [hasAnyWinner, setHasAnyWinner] = useState(false);
  // true jika undian periode saat ini sudah dilakukan (disable Undian button)
  const [currentPeriodUndianDone, setCurrentPeriodUndianDone] = useState(false);
  // user_id pemenang periode saat ini (untuk prompt pemenang set tanggal)
  const [currentWinnerId, setCurrentWinnerId] = useState<string | null>(null);
  // Tanggal pelaksanaan arisan periode saat ini (dari periods.tanggal_pelaksanaan)
  const [currentExecutionDate, setCurrentExecutionDate] = useState<string | null>(null);
  // Apakah periode sebelumnya sudah closed (untuk enable undian Mode 2)
  const [prevPeriodClosed, setPrevPeriodClosed] = useState(true);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (token && isOnline) {
        const [data, actRes] = await Promise.all([
          getGroupDetail(token, groupId),
          getActivityLog(token, groupId, 3, 0).catch(() => ({ entries: [], has_more: false })),
        ]);
        setGroup(data);
        setRecentActivity(actRes.entries);
        setLastUpdated(new Date());
        await cache.set(CACHE_KEYS.groupDetail(groupId), data);

        if (data.current_period_id) {
          const [paymentsRes, periodsRes, undianRes] = await Promise.all([
            getPayments(token, groupId, data.current_period_id).catch((): Payment[] => []),
            getPeriods(token, groupId).catch(() => []),
            undianApi.getHistory(groupId, token).catch(() => ({ winners: [] })),
          ]);
          const statusMap: Record<string, 'lunas' | 'belum' | 'terlambat'> = {};
          for (const p of paymentsRes) {
            statusMap[p.user_id] = p.status === 'confirmed' ? 'lunas' : p.status === 'late' ? 'terlambat' : 'belum';
          }
          setPaymentStatusMap(statusMap);
          setPaidCount(paymentsRes.filter((p) => p.status === 'confirmed').length);
          const currentP = periodsRes.find((p) => p.id === data.current_period_id);
          if (currentP?.due_date) setCurrentPeriodDue(currentP.due_date);
          setCurrentExecutionDate(currentP?.execution_date ?? null);
          // Periode sebelumnya sudah closed?
          const prevP = data.current_period != null
            ? periodsRes.find((p) => p.period_number === data.current_period! - 1)
            : null;
          setPrevPeriodClosed(!prevP || prevP.status === 'closed');  // periode 1 = tidak ada prev → treat as closed
          const winner = data.current_period != null
            ? undianRes.winners.find((w) => w.period_number === data.current_period)
            : undefined;
          setCurrentWinnerName(winner?.winner_name ?? null);
          setCurrentWinnerId(winner?.user_id ?? null);
          setHasAnyWinner(undianRes.winners.length > 0);
          setCurrentPeriodUndianDone(!!winner);
        }
      } else {
        const cached = await cache.get<GroupDetail>(CACHE_KEYS.groupDetail(groupId));
        if (cached) {
          setGroup(cached.data);
          setLastUpdated(new Date());
        }
      }
    } catch {
      const cached = await cache.get<GroupDetail>(CACHE_KEYS.groupDetail(groupId));
      if (cached) {
        setGroup(cached.data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, groupId, isOnline]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh saat kembali dari Bayar/Undian/Chat/Swap
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const handleGenerateInvite = async () => {
    if (!token) return;
    setActionLoading(true);
    try {
      const { invite_code } = await generateInvite(token, groupId);
      navigation.navigate('Invite', { groupId, inviteCode: invite_code, groupName: group?.name ?? groupName });
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Gagal generate kode invite.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Keluar Grup',
      `Yakin mau keluar dari "${group?.name ?? groupName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              await leaveGroup(token, groupId);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal keluar dari grup.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDisband = () => {
    Alert.alert(
      'Bubarkan Grup',
      `Yakin mau membubarkan "${group?.name ?? groupName}"? Aksi ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bubarkan',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              await disbandGroup(token, groupId);
              navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal membubarkan grup.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleKickMember = (memberId: string, memberName: string) => {
    const isActive = group?.status === 'active';
    Alert.alert(
      'Keluarkan Anggota',
      isActive
        ? `Keluarkan paksa ${memberName}? Karena arisan sedang berjalan, aksi ini tidak bisa dibatalkan. Payment pending periode ini akan dihapus.`
        : `Keluarkan ${memberName} dari grup?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluarkan',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              const result = await kickMember(token, groupId, memberId);
              Alert.alert(
                'Berhasil',
                result.was_active
                  ? `${memberName} dikeluarkan. Slot undian otomatis dikurangi.`
                  : `${memberName} berhasil dikeluarkan.`
              );
              load();
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal mengeluarkan anggota.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTanggalSubmit = async () => {
    if (!token || !group?.current_period_id) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalInput)) {
      Alert.alert('Format Salah', 'Masukkan tanggal dengan format YYYY-MM-DD, contoh: 2026-06-15');
      return;
    }
    setTanggalLoading(true);
    try {
      await setTanggalPelaksanaan(token, groupId, group.current_period_id, tanggalInput);
      setShowTanggalModal(false);
      setTanggalInput('');
      Alert.alert('Berhasil', `Tanggal pelaksanaan diset ke ${tanggalInput}`);
      load();
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Gagal mengatur tanggal.');
    } finally {
      setTanggalLoading(false);
    }
  };

  const members = group?.members ?? [];

  // Mode 3: semua anggota sudah punya slot_order → urutan tersimpan → Undian disabled
  const allHaveSlotOrder = members.length > 0 && members.every((m) => m.slot_order !== null);

  // Undian button disabled ketika:
  // - Mode 3 (manual): urutan sudah tersimpan (satu kali selamanya)
  // - Mode 1 (fixed): periode ini sudah ada pemenang
  // - Mode 2 (random): periode ini sudah ada pemenang, ATAU tanggal pelaksanaan belum tiba, ATAU periode sebelumnya belum closed
  const executionDateArrived = !currentExecutionDate || new Date(currentExecutionDate) <= new Date();
  const undianMode2Blocked = !prevPeriodClosed || !executionDateArrived;
  const undianButtonDisabled =
    !group?.current_period_id ||
    (group.draw_mode === 'manual'
      ? allHaveSlotOrder
      : group.draw_mode === 'random'
      ? (currentPeriodUndianDone || undianMode2Blocked)
      : currentPeriodUndianDone);

  // Tukar aktif hanya setelah undian pernah dilakukan (ada pemenang minimal 1x)
  // Mode 3: setelah order disimpan
  const tukarEnabled = group?.draw_mode === 'manual' ? allHaveSlotOrder : hasAnyWinner;

  // Pemenang periode ini (untuk Mode 2: winner bisa set tanggal)
  const isWinner = !!user && !!currentWinnerId && user.id === currentWinnerId && !isKetua;
  // Prompt tanggal untuk pemenang: tampil jika Mode 2, user adalah pemenang, tanggal belum diset
  const showWinnerTanggalPrompt = isWinner && !currentPeriodDue && group?.draw_mode === 'random';

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar onBack={() => navigation.goBack()} title="Detail Grup" />
        <ScrollView contentContainerStyle={styles.body}>
          {/* identity skeleton */}
          <View style={[styles.identity, { marginBottom: 16 }]}>
            <SkeletonBar width={52} height={52} borderRadius={16} />
            <View style={styles.flex}>
              <SkeletonBar width="55%" height={14} style={{ marginBottom: 9 }} />
              <SkeletonBar width="70%" height={11} />
            </View>
          </View>
          {/* status card skeleton */}
          <SkeletonBar height={112} borderRadius={12} style={{ marginBottom: 16 }} />
          {/* quick actions skeleton */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBar key={i} style={{ flex: 1 }} height={72} borderRadius={16} />
            ))}
          </View>
          {/* section header skeleton */}
          <SkeletonBar width={160} height={13} style={{ marginBottom: 12 }} />
          {/* member grid skeleton */}
          <Card>
            <View style={styles.memberGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonBar key={i} width={58} height={70} borderRadius={14} />
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        onBack={() => navigation.goBack()}
        title="Detail Grup"
        right={
          <View style={styles.menuBtn}>
            <Icon name="grip" size={20} color={Colors.ink} />
          </View>
        }
      />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.groupAvatar}>
            <Text style={styles.groupInitial}>{groupName[0]}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.groupName}>{group?.name ?? groupName}</Text>
            <Text style={styles.groupMeta}>
              {members.length} anggota · Rp {(group?.nominal ?? 0).toLocaleString('id')} · {FREQUENCY_LABEL[group?.frequency ?? ''] ?? group?.frequency ?? '—'}
            </Text>
            <Text style={styles.groupMetaDraw}>
              <Text style={styles.groupMetaLabel}>Mode undian: </Text>
              {DRAW_MODE_LABEL[group?.draw_mode ?? ''] ?? group?.draw_mode ?? '—'}
            </Text>
          </View>
          {isKetua && <Pill tone="solid">Ketua</Pill>}
        </View>

        {/* Invite Code (recruiting) */}
        {group?.status === 'recruiting' && (
          <Card accent tint pad={16} style={styles.inviteCard}>
            <View style={styles.inviteRow}>
              <View style={styles.flex}>
                <Text style={styles.inviteLabel}>KODE INVITE</Text>
                <Text style={styles.inviteCode}>{group.invite_code}</Text>
              </View>
              <View style={styles.inviteBtns}>
                <TouchableOpacity
                  onPress={() => Clipboard.setString(group.invite_code)}
                  style={styles.inviteBtn}
                  disabled={!isOnline}
                >
                  <Icon name="copy" size={18} color={Colors.primaryInk} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Share.share({ message: `Gabung arisan "${group.name}" pakai kode: ${group.invite_code}` })}
                  style={styles.inviteBtn}
                  disabled={!isOnline}
                >
                  <Icon name="share" size={18} color={Colors.primaryInk} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Status Hero */}
        <Card accent tint pad={18} style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View>
              <Text style={styles.periodeLabel}>PERIODE {group?.current_period ?? 1} DARI {group?.total_periods ?? 12}</Text>
              <View style={styles.winnerRow}>
                <Icon name="trophy" size={18} color={Colors.primaryInk} />
                <Text style={styles.winnerText}>
                  {currentWinnerName ? `Pemenang: ${currentWinnerName}` : 'Belum ada pemenang'}
                </Text>
              </View>
            </View>
            {currentPeriodDue ? (
              <View style={styles.dueWrap}>
                <Text style={styles.dueLabel}>Jatuh tempo</Text>
                <Text style={[styles.dueDate, new Date(currentPeriodDue) < new Date() && styles.dueDateOverdue]}>
                  {new Date(currentPeriodDue).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  {' · H-'}
                  {Math.max(0, Math.ceil((new Date(currentPeriodDue).getTime() - Date.now()) / 86400000))}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Sudah bayar</Text>
              <Text style={styles.progressLabel}>{paidCount} / {members.length || 0}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${members.length > 0 ? (paidCount / members.length) * 100 : 0}%` }]} />
            </View>
          </View>
        </Card>

        {/* Mode 2: Prompt untuk pemenang agar set tanggal arisan */}
        {showWinnerTanggalPrompt && (
          <Card accent tint pad={16} style={styles.winnerPromptCard}>
            <View style={styles.winnerPromptRow}>
              <Icon name="trophy" size={20} color={Colors.primaryInk} />
              <View style={styles.flex}>
                <Text style={styles.winnerPromptTitle}>Selamat! Kamu menang periode ini 🎉</Text>
                <Text style={styles.winnerPromptSub}>Tentukan tanggal pelaksanaan arisan. Jika tidak diisi, ketua akan mengaturnya.</Text>
              </View>
            </View>
            <Btn
              full size="md" variant="outline" icon="calendar"
              onPress={() => { setTanggalInput(''); setShowTanggalModal(true); }}
              disabled={!isOnline}
              style={styles.winnerPromptBtn}
            >
              Tentukan Tanggal Arisan
            </Btn>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((a) => {
            const isUndian = a.screen === 'UndianPre';
            const isTukar = a.screen === 'RequestSwap';
            const isBayar = a.screen === 'Bayar';

            const myPaymentStatus = paymentStatusMap[user?.id ?? ''];
            const alreadyPaid = myPaymentStatus === 'lunas';

            const isDisabled =
              (isBayar && (!isOnline || !group?.current_period_id || alreadyPaid)) ||
              (isUndian && (!isOnline || undianButtonDisabled)) ||
              (isTukar && (!isOnline || !tukarEnabled)) ||
              (!isUndian && !isTukar && !isBayar && !isOnline && 'primary' in a && (a as any).primary);

            return (
              <TouchableOpacity
                key={a.label}
                onPress={() => {
                  if (isBayar) {
                    if (!group?.current_period_id) return;
                    navigation.navigate('Bayar', { groupId, periodId: group.current_period_id, periodNumber: group?.current_period ?? 1 });
                  } else if (a.screen === 'Chat') {
                    navigation.navigate('Chat', {
                      groupId, groupName, memberCount: members.length,
                      ketuaId: group?.created_by ?? '',
                      periodNumber: group?.current_period ?? undefined,
                      winnerName: currentWinnerName, paidCount, dueDate: currentPeriodDue,
                    });
                  } else if (isTukar) {
                    if (!tukarEnabled) {
                      Alert.alert('Belum Bisa', 'Tukar giliran baru bisa dilakukan setelah undian pertama selesai.');
                      return;
                    }
                    Alert.alert('Tukar Giliran', 'Pilih aksi:', [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Inbox Tukar (masuk)', onPress: () => navigation.navigate('SwapInbox') },
                      {
                        text: 'Ajukan Tukar',
                        onPress: () => {
                          const me = members.find((m) => m.user_id === user?.id);
                          if (!me?.slot_order) {
                            Alert.alert('Belum Ada Giliran', 'Giliran kamu belum diatur oleh ketua. Hubungi ketua grup untuk mengatur giliran.');
                            return;
                          }
                          navigation.navigate('RequestSwap', { groupId, myPeriod: me.slot_order });
                        },
                      },
                    ]);
                  } else if (isUndian) {
                    navigation.navigate('UndianPre', { groupId, periodId: group?.current_period_id ?? '', periodNumber: group?.current_period ?? 1, isKetua });
                  }
                }}
                style={[
                  styles.quickBtn,
                  'primary' in a && (a as any).primary && styles.quickBtnPrimary,
                  isDisabled && styles.quickBtnDisabled,
                ]}
                disabled={isDisabled}
              >
                <Icon
                  name={a.icon}
                  size={22}
                  color={isDisabled ? Colors.muted : ('primary' in a && (a as any).primary ? Colors.white : Colors.ink)}
                  strokeWidth={2}
                />
                <Text style={[
                  styles.quickLabel,
                  'primary' in a && (a as any).primary && styles.quickLabelPrimary,
                  isDisabled && styles.quickLabelDisabled,
                ]}>
                  {isBayar && alreadyPaid ? 'Lunas ✓' : a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mode 2: hint mengapa undian belum bisa dilakukan */}
        {group?.draw_mode === 'random' && !currentPeriodUndianDone && undianMode2Blocked && isKetua && group?.current_period_id && (
          <View style={styles.undianHint}>
            <Icon name="alert" size={14} color={Colors.amber} />
            <Text style={styles.undianHintText}>
              {!prevPeriodClosed
                ? 'Undian bisa dilakukan setelah ketua menutup pembayaran periode sebelumnya.'
                : 'Undian bisa dilakukan setelah tanggal pelaksanaan tiba. Pastikan pemenang sudah mengatur tanggal.'}
            </Text>
          </View>
        )}

        {/* Ketua Actions — icon-tile card */}
        {isKetua && (
          <Card style={styles.ketuaCard}>
            <Text style={styles.ketuaCardTitle}>Kelola Grup</Text>

            {/* Icon tile grid — aksi umum */}
            <View style={styles.ketuaTileRow}>
              <TouchableOpacity
                style={[styles.ketuaTile, (!isOnline || actionLoading) && styles.ketuaTileDisabled]}
                onPress={() => navigation.navigate('SetGiliran', { groupId, members: members.map(m => ({ id: m.user_id, name: m.user.name ?? m.user.phone, slot_order: m.slot_order })), isLocked: group?.status === 'active' || group?.status === 'completed' })}
                disabled={!isOnline || actionLoading}
              >
                <View style={styles.ketuaTileIcon}>
                  <Icon name="users" size={20} color={Colors.primaryInk} strokeWidth={2} />
                </View>
                <Text style={styles.ketuaTileLabel}>Set{'\n'}Giliran</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ketuaTile, (!isOnline || actionLoading) && styles.ketuaTileDisabled]}
                onPress={handleGenerateInvite}
                disabled={!isOnline || actionLoading}
              >
                <View style={styles.ketuaTileIcon}>
                  <Icon name="share" size={20} color={Colors.primaryInk} strokeWidth={2} />
                </View>
                <Text style={styles.ketuaTileLabel}>Kode{'\n'}Invite</Text>
              </TouchableOpacity>

              {group?.status === 'active' && group?.current_period_id && (
                <TouchableOpacity
                  style={[styles.ketuaTile, (!isOnline || actionLoading) && styles.ketuaTileDisabled]}
                  onPress={() => { setTanggalInput(''); setShowTanggalModal(true); }}
                  disabled={!isOnline || actionLoading}
                >
                  <View style={styles.ketuaTileIcon}>
                    <Icon name="calendar" size={20} color={Colors.primaryInk} strokeWidth={2} />
                  </View>
                  <Text style={styles.ketuaTileLabel}>Atur{'\n'}Tanggal</Text>
                </TouchableOpacity>
              )}

              {group?.draw_mode === 'random' && hasAnyWinner && (
                <TouchableOpacity
                  style={[styles.ketuaTile, (!isOnline || actionLoading) && styles.ketuaTileDisabled]}
                  onPress={() => navigation.navigate('SwapByKetua', { groupId, groupName, winnerId: currentWinnerId ?? undefined, winnerName: currentWinnerName ?? undefined })}
                  disabled={!isOnline || actionLoading}
                >
                  <View style={styles.ketuaTileIcon}>
                    <Icon name="swap" size={20} color={Colors.primaryInk} strokeWidth={2} />
                  </View>
                  <Text style={styles.ketuaTileLabel}>Tukar{'\n'}Giliran</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List rows — aksi kontekstual */}
            <View style={styles.ketuaRowDivider} />

            <TouchableOpacity
              style={[styles.ketuaRow, !isOnline && styles.ketuaRowDisabled]}
              onPress={() => navigation.navigate('SwapApproval', { groupId, groupName })}
              disabled={!isOnline}
            >
              <View style={[styles.ketuaRowIcon, { backgroundColor: '#EAF2FF' }]}>
                <Icon name="checkCircle" size={18} color="#2D6FD6" strokeWidth={2} />
              </View>
              <Text style={styles.ketuaRowLabel}>Approval Tukar Giliran</Text>
              <Icon name="chevronRight" size={16} color={Colors.muted} strokeWidth={2} />
            </TouchableOpacity>

            {/* Danger zone */}
            <View style={styles.ketuaRowDivider} />
            <TouchableOpacity
              style={[styles.ketuaRow, (!isOnline || actionLoading) && styles.ketuaRowDisabled]}
              onPress={handleDisband}
              disabled={!isOnline || actionLoading}
            >
              <View style={[styles.ketuaRowIcon, { backgroundColor: Colors.dangerTint }]}>
                <Icon name="alert" size={18} color={Colors.danger} strokeWidth={2} />
              </View>
              <Text style={[styles.ketuaRowLabel, { color: Colors.danger }]}>Bubarkan Grup</Text>
              <Icon name="chevronRight" size={16} color={Colors.danger} strokeWidth={2} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Anggota Action */}
        {!isKetua && group && (
          <Btn
            full size="md" variant="outline"
            onPress={handleLeave}
            disabled={!isOnline || actionLoading}
            style={[styles.leaveBtn]}
            textStyle={{ color: Colors.danger }}
          >
            Keluar Grup
          </Btn>
        )}

        {/* Offline tooltip untuk aksi kritis */}
        {!isOnline && (
          <Text style={styles.offlineHint}>Butuh koneksi internet untuk melakukan aksi ini.</Text>
        )}

        {/* Stale label */}
        {!isOnline && lastUpdated && (
          <Text style={styles.staleLabel}>
            Data terakhir diperbarui: {fmtLastUpdated(lastUpdated)}
          </Text>
        )}

        {/* Member Status */}
        <View style={styles.section}>
          <SectionLabel>
            Status bayar periode {group?.current_period ?? 1}
          </SectionLabel>
          {/* Action pills — Buku Kas / Riwayat / Kelola */}
          <View style={styles.paymentPillRow}>
            <TouchableOpacity
              style={styles.paymentPill}
              onPress={() => navigation.navigate('BukuArisan', { groupId, groupName: group?.name ?? groupName })}
            >
              <Icon name="fileText" size={13} color={Colors.primaryInk} strokeWidth={2} />
              <Text style={styles.paymentPillText}>Buku Kas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentPill}
              onPress={() => navigation.navigate('PaymentHistory', { groupId, groupName: group?.name ?? groupName })}
            >
              <Icon name="clock" size={13} color={Colors.primaryInk} strokeWidth={2} />
              <Text style={styles.paymentPillText}>Riwayat</Text>
            </TouchableOpacity>
            {isKetua && group?.current_period_id && (
              <TouchableOpacity
                style={[styles.paymentPill, styles.paymentPillPrimary]}
                onPress={() => navigation.navigate('Bayar', { groupId, periodId: group.current_period_id!, periodNumber: group?.current_period ?? 1 })}
              >
                <Icon name="wallet" size={13} color={Colors.white} strokeWidth={2} />
                <Text style={[styles.paymentPillText, { color: Colors.white }]}>Kelola Bayar</Text>
              </TouchableOpacity>
            )}
          </View>
          <Card>
            <View style={styles.memberGrid}>
              {(members.length > 0 ? members : Array(8).fill({ user: { name: '?' }, id: '' })).map((m, i) => (
                <TouchableOpacity
                  key={m.user_id ?? i}
                  onLongPress={
                    isKetua && m.user_id && m.user_id !== user?.id
                      ? () => handleKickMember(m.user_id, m.user?.name ?? m.user?.phone ?? 'anggota')
                      : undefined
                  }
                  activeOpacity={isKetua && m.user_id !== user?.id ? 0.7 : 1}
                >
                  <AnggotaItem
                    name={m.user?.name ?? m.user?.phone ?? `A${i + 1}`}
                    status={paymentStatusMap[m.user_id] ?? 'belum'}
                    isMe={m.user_id === user?.id}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {isKetua && members.length > 1 && (
              <Text style={styles.kickHint}>Tekan lama anggota untuk mengeluarkan.</Text>
            )}
          </Card>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <SectionLabel right={<Text style={styles.seeAll} onPress={() => navigation.navigate('ActivityLog', { groupId, groupName })}>Semua</Text>}>
            Aktivitas terbaru
          </SectionLabel>
          <Card pad={6}>
            {recentActivity.length === 0 ? (
              <View style={styles.actRow}>
                <Text style={styles.actEmpty}>Belum ada aktivitas di grup ini.</Text>
              </View>
            ) : (
              recentActivity.map((a, i) => {
                const when = (() => {
                  if (!a.created_at) return '';
                  const d = new Date(a.created_at);
                  const now = new Date();
                  const diffH = (now.getTime() - d.getTime()) / 3600000;
                  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m`;
                  if (diffH < 24) return `${Math.round(diffH)}j`;
                  if (diffH < 48) return 'Kemarin';
                  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                })();
                return (
                  <View key={a.id} style={[styles.actRow, i < recentActivity.length - 1 && styles.actBorder]}>
                    <View style={[styles.actIcon, { backgroundColor: TONE_BG[a.tone] ?? Colors.surface }]}>
                      <Icon name={a.icon} size={20} color={TONE_FG[a.tone] ?? Colors.mutedStrong} strokeWidth={2} />
                    </View>
                    <Text style={styles.actText} numberOfLines={2}>{a.text}</Text>
                    {when ? <Text style={styles.actWhen}>{when}</Text> : null}
                  </View>
                );
              })
            )}
          </Card>
          <View style={styles.immutableNote}>
            <Icon name="lock" size={13} color={Colors.muted} />
            <Text style={styles.immutableText}>Aktivitas tercatat permanen — tidak bisa diubah</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Atur Tanggal Pelaksanaan */}
      <Modal visible={showTanggalModal} transparent animationType="fade" onRequestClose={() => setShowTanggalModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Atur Tanggal Pelaksanaan</Text>
            <Text style={styles.modalSub}>Format: YYYY-MM-DD (contoh: 2026-06-15)</Text>
            <TextInput
              style={styles.modalInput}
              value={tanggalInput}
              onChangeText={setTanggalInput}
              placeholder="2026-06-15"
              placeholderTextColor={Colors.muted}
              keyboardType="default"
              maxLength={10}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowTanggalModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelLabel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTanggalSubmit}
                disabled={tanggalLoading || !tanggalInput}
                style={[styles.modalConfirmBtn, (tanggalLoading || !tanggalInput) && styles.modalConfirmBtnDisabled]}
              >
                <Text style={styles.modalConfirmLabel}>{tanggalLoading ? 'Menyimpan...' : 'Simpan'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
  flex: { flex: 1 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
  groupAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  groupInitial: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.primaryInk, fontWeight: '600' },
  groupName: { fontFamily: Fonts.displaySemiBold, fontSize: 19, color: Colors.ink, letterSpacing: -0.3, fontWeight: '600' },
  groupMeta: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginTop: 1 },
  groupMetaDraw: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginTop: 2 },
  groupMetaLabel: { fontFamily: Fonts.bodySemiBold, color: Colors.mutedStrong, fontWeight: '600' },
  inviteCard: { marginBottom: 14 },
  winnerPromptCard: { marginBottom: 14 },
  winnerPromptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  winnerPromptTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  winnerPromptSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 2, lineHeight: 18 },
  winnerPromptBtn: {},
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inviteLabel: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.muted, letterSpacing: 1, fontWeight: '700' },
  inviteCode: { fontFamily: Fonts.displaySemiBold, fontSize: 26, color: Colors.ink, letterSpacing: 4, marginTop: 2, fontWeight: '600' },
  inviteBtns: { flexDirection: 'row', gap: 8 },
  inviteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  statusCard: { marginBottom: 16 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  periodeLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted, fontWeight: '700', letterSpacing: 0.3 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  winnerText: { fontFamily: Fonts.displaySemiBold, fontSize: 18, color: Colors.ink, fontWeight: '600' },
  dueWrap: { alignItems: 'flex-end' },
  dueLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  dueDate: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.amberInk, marginTop: 3, fontWeight: '600' },
  dueDateOverdue: { color: Colors.danger },
  progressWrap: { marginTop: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.mutedStrong, fontWeight: '600' },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,168,126,0.18)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, borderRadius: 16, padding: 13, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  quickBtnPrimary: { backgroundColor: Colors.primary, borderWidth: 0, shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  quickBtnDisabled: { opacity: 0.4 },
  quickLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600' },
  quickLabelPrimary: { color: Colors.white },
  quickLabelDisabled: { color: Colors.muted },
  undianHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.amberTint, borderRadius: 10, padding: 10, marginBottom: 10 },
  undianHintText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.amberInk, lineHeight: 17 },
  // Ketua card
  ketuaCard: { marginBottom: 12, gap: 0, padding: 0, overflow: 'hidden' },
  ketuaCardTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  ketuaTileRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  ketuaTile: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4 },
  ketuaTileDisabled: { opacity: 0.4 },
  ketuaTileIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  ketuaTileLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 11.5, color: Colors.ink, fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  ketuaRowDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 0 },
  ketuaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  ketuaRowDisabled: { opacity: 0.4 },
  ketuaRowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ketuaRowLabel: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink, fontWeight: '500' },
  // Leave button
  leaveBtn: { borderColor: Colors.dangerTint, marginBottom: 8 },
  // Payment pills
  paymentPillRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  paymentPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: Colors.primaryTint, backgroundColor: Colors.primaryTint, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  paymentPillPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paymentPillText: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, color: Colors.primaryInk, fontWeight: '600' },
  offlineHint: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  staleLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 22 },
  seeAll: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.primaryInk, fontWeight: '600' },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actRow: { flexDirection: 'row', gap: 12, padding: 11, alignItems: 'center' },
  actBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  actIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actText: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: Colors.ink, fontWeight: '500', lineHeight: 19 },
  actWhen: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, flexShrink: 0 },
  actEmpty: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, textAlign: 'center', paddingVertical: 8 },
  kickHint: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, textAlign: 'center', paddingTop: 8, paddingBottom: 4 },
  immutableNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 },
  immutableText: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { width: '100%', backgroundColor: Colors.bg, borderRadius: 16, padding: 24 },
  modalTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 17, color: Colors.ink, fontWeight: '600', marginBottom: 4 },
  modalSub: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginBottom: 16 },
  modalInput: { height: 48, borderWidth: 1.5, borderRadius: 8, borderColor: Colors.border, paddingHorizontal: 14, fontFamily: Fonts.bodyRegular, fontSize: 15, color: Colors.ink, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink, fontWeight: '600' },
  modalConfirmBtn: { flex: 1, height: 46, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtnDisabled: { opacity: 0.45 },
  modalConfirmLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white, fontWeight: '600' },
});
