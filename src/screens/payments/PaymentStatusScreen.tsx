import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SkeletonBar } from '../../components/ui/SkeletonBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { usePaymentRealtime } from '../../hooks/usePaymentRealtime';
import { cancelConfirm, confirmPayment, getPayments, getPeriods, Payment, Period } from '../../api/payments';
import { getGroupDetail, GroupMember } from '../../api/groups';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = NativeStackScreenProps<AppStackParamList, 'Bayar'>;

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function fmtDue(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtLastUpdated(d: Date): string {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ', ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function PaymentStatusScreen({ navigation, route }: Props) {
  const { groupId, periodId, periodNumber } = route.params;
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();

  const [rawPayments, setRawPayments] = useState<Payment[]>([]);
  const [period, setPeriod] = useState<Period | null>(null);
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});
  const [isKetua, setIsKetua] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [modalPayment, setModalPayment] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const payments = usePaymentRealtime(periodId, rawPayments);

  const fetchData = useCallback(async (fromCache = false) => {
    if (!token) return;
    try {
      if (!fromCache) setError(null);

      const [paymentsData, groupData, periodsData] = await Promise.all([
        getPayments(token, groupId, periodId),
        getGroupDetail(token, groupId),
        getPeriods(token, groupId),
      ]);

      const found = periodsData.find((p) => p.id === periodId) ?? null;
      const map: Record<string, string> = {};
      groupData.members.forEach((m: GroupMember) => {
        map[m.user_id] = m.user.name ?? m.user.phone;
      });

      // Build full rows: semua member muncul, merge dengan payment data yang ada
      const fullPayments: Payment[] = groupData.members.map((m) => {
        const existing = paymentsData.find((p) => p.user_id === m.user_id);
        if (existing) return existing;
        return {
          id: null,
          period_id: periodId,
          user_id: m.user_id,
          status: 'pending',
          confirmed_by: null,
          confirmed_at: null,
          user: { name: m.user.name, phone: m.user.phone },
        };
      });

      setRawPayments(fullPayments);
      setPeriod(found);
      setMemberMap(map);
      setIsKetua(groupData.created_by === user?.id);
      setTotalMembers(groupData.members.length);
      setLastUpdated(new Date());

      await cache.set(CACHE_KEYS.payments(periodId), { payments: fullPayments, period: found, memberMap: map, isKetua: groupData.created_by === user?.id, totalMembers: groupData.members.length });
    } catch (e: any) {
      if (!fromCache) setError('Gagal memuat data pembayaran. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [token, groupId, periodId, user?.id]);

  useEffect(() => {
    (async () => {
      const cached = await cache.get<{ payments: Payment[]; period: Period | null; memberMap: Record<string, string>; isKetua: boolean; totalMembers: number }>(CACHE_KEYS.payments(periodId));
      if (cached) {
        setRawPayments(cached.data.payments);
        setPeriod(cached.data.period);
        setMemberMap(cached.data.memberMap);
        setIsKetua(cached.data.isKetua);
        setTotalMembers(cached.data.totalMembers);
        setLoading(false);
        setLastUpdated(new Date());
      }
      if (isOnline) fetchData(!!cached);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOnline) fetchData(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleAction = async () => {
    if (!token || !modalPayment) return;
    setActionLoading(true);
    try {
      if (modalPayment.status === 'confirmed') {
        await cancelConfirm(token, groupId, periodId, modalPayment.user_id);
      } else {
        await confirmPayment(token, groupId, periodId, modalPayment.user_id);
      }
      setModalPayment(null);
      await fetchData(true);
    } catch {
      // keep modal open, user can retry
    } finally {
      setActionLoading(false);
    }
  };

  const paidCount = payments.filter((p) => p.status === 'confirmed').length;
  const total = totalMembers || payments.length;
  const progressPct = total > 0 ? paidCount / total : 0;
  const isDueOverdue = period?.due_date ? new Date(period.due_date) < new Date() : false;

  const memberName = (p: Payment) =>
    p.user?.name ?? p.user?.phone ?? '?';

  const confirmerName = (p: Payment) =>
    p.confirmed_by ? (memberMap[p.confirmed_by] ?? 'Ketua') : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppBar
        title={`Status Bayar — Periode ${periodNumber}`}
        onBack={() => navigation.goBack()}
        right={
          isOnline ? (
            <Pill tone="solid" dot style={styles.liveBadge}>Live</Pill>
          ) : undefined
        }
      />
      <OfflineBanner />

      {loading ? (
        <ScrollView contentContainerStyle={styles.body}>
          {/* due date skeleton */}
          <SkeletonBar height={44} borderRadius={10} />
          {/* progress skeleton */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <SkeletonBar width="55%" height={13} />
              <SkeletonBar width={40} height={13} />
            </View>
            <SkeletonBar height={8} borderRadius={999} />
          </View>
          {/* member rows skeleton */}
          <Card pad={6} style={styles.memberCard}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.memberRow, i < 3 && styles.memberBorder]}>
                <SkeletonBar width={38} height={38} borderRadius={19} />
                <View style={styles.flex}>
                  <SkeletonBar width="50%" height={13} style={{ marginBottom: 6 }} />
                  <SkeletonBar width="35%" height={11} />
                </View>
                <SkeletonBar width={62} height={24} borderRadius={8} />
              </View>
            ))}
          </Card>
        </ScrollView>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchData()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {/* Due date */}
          {period?.due_date && (
            <View style={[styles.dueRow, isDueOverdue && styles.dueRowOverdue]}>
              <Text style={[styles.dueLabel, isDueOverdue && styles.dueLabelOverdue]}>
                {isDueOverdue ? '⚠ Jatuh tempo terlewat: ' : 'Jatuh tempo: '}
                <Text style={styles.dueDateText}>{fmtDue(period.due_date)}</Text>
              </Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{paidCount}/{total} anggota sudah bayar</Text>
              <Text style={styles.progressPct}>{Math.round(progressPct * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct * 100}%` as any }]} />
            </View>
          </View>

          {/* Member list */}
          <Card pad={6} style={styles.memberCard}>
            {payments.map((p, i) => (
              <TouchableOpacity
                key={p.user_id}
                style={[
                  styles.memberRow,
                  i < payments.length - 1 && styles.memberBorder,
                  !isKetua && styles.memberRowNoTap,
                ]}
                onPress={() => isKetua && setModalPayment(p)}
                disabled={!isKetua || !isOnline}
                activeOpacity={isKetua ? 0.7 : 1}
              >
                <Avatar name={memberName(p)} size={38} />
                <View style={styles.flex}>
                  <Text style={styles.memberName}>{memberName(p)}</Text>
                  {p.status === 'confirmed' ? (
                    <Text style={styles.subConfirmed}>
                      Dikonfirmasi {confirmerName(p)}{p.confirmed_at ? ' · ' + fmtDate(p.confirmed_at) : ''}
                    </Text>
                  ) : p.status === 'late' ? (
                    <Text style={styles.subLate}>⚠ Terlambat</Text>
                  ) : (
                    <Text style={styles.subPending}>⏰ Belum bayar</Text>
                  )}
                </View>
                <StatusBadge status={p.status} />
              </TouchableOpacity>
            ))}
            {payments.length === 0 && (
              <Text style={styles.emptyText}>Belum ada data pembayaran.</Text>
            )}
          </Card>

          {/* Offline last updated */}
          {!isOnline && lastUpdated && (
            <Text style={styles.lastUpdated}>
              Data terakhir diperbarui: {fmtLastUpdated(lastUpdated)}
            </Text>
          )}

          {isKetua && isOnline && (
            <Text style={styles.tapHint}>Ketuk anggota untuk konfirmasi atau batalkan bayar.</Text>
          )}
          {isKetua && !isOnline && (
            <Text style={styles.tapHint}>Butuh koneksi internet untuk melakukan aksi ini.</Text>
          )}
        </ScrollView>
      )}

      {/* Confirm/Cancel Modal */}
      <Modal
        visible={!!modalPayment}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPayment(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {modalPayment && (
              <>
                <Text style={styles.modalTitle}>
                  {modalPayment.status === 'confirmed'
                    ? `Batalkan konfirmasi ${memberName(modalPayment)}?`
                    : `Konfirmasi bayar ${memberName(modalPayment)}?`}
                </Text>
                <Text style={styles.modalSub}>
                  {modalPayment.status === 'confirmed'
                    ? 'Status anggota akan kembali ke "Belum bayar".'
                    : 'Konfirmasi ini akan tercatat atas nama Anda sebagai ketua.'}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => setModalPayment(null)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirm,
                      modalPayment.status === 'confirmed' && styles.modalConfirmDanger,
                    ]}
                    onPress={handleAction}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <Text style={styles.modalConfirmText}>
                        {modalPayment.status === 'confirmed' ? 'Batalkan' : 'Konfirmasi'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'confirmed') {
    return (
      <View style={badge.confirmed}>
        <Text style={badge.confirmedText}>✓ Lunas</Text>
      </View>
    );
  }
  if (status === 'late') {
    return (
      <View style={badge.late}>
        <Text style={badge.lateText}>⚠ Telat</Text>
      </View>
    );
  }
  return (
    <View style={badge.pending}>
      <Text style={badge.pendingText}>⏰ Pending</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  confirmed: { backgroundColor: Colors.primaryTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  confirmedText: { color: Colors.primaryInk, fontFamily: Fonts.bodySemiBold, fontSize: 11.5, fontWeight: '600' },
  late: { backgroundColor: Colors.dangerTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  lateText: { color: Colors.danger, fontFamily: Fonts.bodySemiBold, fontSize: 11.5, fontWeight: '600' },
  pending: { backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 11.5, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  body: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  flex: { flex: 1 },
  liveBadge: { marginRight: 4 },

  dueRow: { backgroundColor: Colors.surface, borderRadius: 10, padding: 12 },
  dueRowOverdue: { backgroundColor: Colors.dangerTint },
  dueLabel: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted },
  dueLabelOverdue: { color: Colors.danger },
  dueDateText: { fontFamily: Fonts.bodySemiBold, fontWeight: '600' },

  progressSection: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.ink, fontWeight: '600' },
  progressPct: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.primaryInk, fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: Colors.surface, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },

  memberCard: { gap: 0 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberRowNoTap: {},
  memberName: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600', marginBottom: 2 },
  subConfirmed: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.primaryInk },
  subLate: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.danger },
  subPending: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, textAlign: 'center', padding: 20 },

  lastUpdated: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 4 },
  tapHint: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 4 },

  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontWeight: '600', fontSize: 14 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.bg, borderRadius: 18, padding: 24, width: '84%', gap: 12 },
  modalTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 17, color: Colors.ink, fontWeight: '600' },
  modalSub: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: Colors.muted, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, height: 44, backgroundColor: Colors.surface, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink, fontWeight: '600' },
  modalConfirm: { flex: 1, height: 44, backgroundColor: Colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalConfirmDanger: { backgroundColor: Colors.danger },
  modalConfirmText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white, fontWeight: '600' },
});
