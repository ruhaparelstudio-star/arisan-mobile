import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { SkeletonBar } from '../../components/ui/SkeletonBar';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getBukuArisan, getHutangInfo, resolveKabur, BukuArisan, BukuPeriod, HutangInfo } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'BukuArisan'>;

const STATUS_PERIOD: Record<string, { label: string; color: string; bg: string }> = {
  closed:   { label: 'Selesai', color: '#00A87E', bg: '#E6FAF5' },
  active:   { label: 'Aktif',   color: '#B45309', bg: '#FFF7E6' },
  upcoming: { label: 'Akan Datang', color: '#888888', bg: '#F8F8F8' },
};

const PAYMENT_STATUS: Record<string, { icon: string; color: string; label: string }> = {
  confirmed: { icon: '✓', color: Colors.primary,  label: 'Lunas' },
  late:      { icon: '⚠', color: '#EF4444',        label: 'Terlambat' },
  pending:   { icon: '⏰', color: '#888888',        label: 'Belum' },
};

function fmtRp(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n.toLocaleString('id')}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDatetime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function PeriodCard({ period, nominal }: { period: BukuPeriod; nominal: number }) {
  const [expanded, setExpanded] = useState(period.status !== 'upcoming');
  const ps = STATUS_PERIOD[period.status] ?? STATUS_PERIOD.upcoming;
  const collectionPct = period.member_count > 0
    ? Math.round((period.paid_count / period.member_count) * 100)
    : 0;

  return (
    <Card style={styles.periodCard}>
      {/* Period Header */}
      <TouchableOpacity style={styles.periodHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={styles.periodHeaderLeft}>
          <View style={[styles.periodBadge, { backgroundColor: ps.bg }]}>
            <Text style={[styles.periodBadgeText, { color: ps.color }]}>{ps.label}</Text>
          </View>
          <Text style={styles.periodTitle}>Periode {period.period_number}</Text>
        </View>
        <View style={styles.periodHeaderRight}>
          <Text style={styles.periodCollected}>{fmtRp(period.total_collected)}</Text>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Period meta */}
      <View style={styles.periodMeta}>
        {period.due_date && (
          <Text style={styles.metaText}>Jatuh tempo: {fmtDate(period.due_date)}</Text>
        )}
        {period.execution_date && (
          <Text style={styles.metaText}>Pelaksanaan: {fmtDate(period.execution_date)}</Text>
        )}
        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${collectionPct}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{period.paid_count}/{period.member_count} lunas</Text>
        </View>
      </View>

      {/* Winner */}
      {period.winner && (
        <View style={styles.winnerRow}>
          <Text style={styles.winnerIcon}>🏆</Text>
          <View style={styles.flex}>
            <Text style={styles.winnerName}>{period.winner.name}</Text>
            <Text style={styles.winnerSub}>
              Menerima {fmtRp(period.winner.amount_received)} · {fmtDate(period.winner.drawn_at)}
            </Text>
          </View>
        </View>
      )}

      {/* Payment rows (expandable) */}
      {expanded && (
        <View style={styles.paymentList}>
          <View style={styles.divider} />
          <Text style={styles.paymentListTitle}>Detail Pembayaran</Text>
          {period.payments.map((p, i) => {
            const ps_p = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending;
            const isWinner = p.user_id === period.winner?.user_id;
            return (
              <View
                key={p.user_id}
                style={[styles.paymentRow, i < period.payments.length - 1 && styles.paymentBorder]}
              >
                {/* Avatar */}
                <View style={[styles.avatar, isWinner && styles.avatarWinner]}>
                  <Text style={[styles.avatarText, isWinner && styles.avatarTextWinner]}>
                    {(p.user_name[0] ?? '?').toUpperCase()}
                  </Text>
                </View>

                {/* Name + meta */}
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.paymentName} numberOfLines={1}>{p.user_name}</Text>
                    {isWinner && (
                      <View style={styles.winnerPill}>
                        <Text style={styles.winnerPillText}>Pemenang</Text>
                      </View>
                    )}
                    {p.slot_order && (
                      <Text style={styles.slotText}>#{p.slot_order}</Text>
                    )}
                  </View>
                  {p.status === 'confirmed' && p.confirmed_by_name && (
                    <Text style={styles.confirmedBy} numberOfLines={1}>
                      Dikonfirmasi {p.confirmed_by_name} · {fmtDatetime(p.confirmed_at)}
                    </Text>
                  )}
                </View>

                {/* Status + amount */}
                <View style={styles.paymentRight}>
                  <View style={[styles.statusPill, { backgroundColor: ps_p.color + '22' }]}>
                    <Text style={[styles.statusPillText, { color: ps_p.color }]}>
                      {ps_p.icon} {ps_p.label}
                    </Text>
                  </View>
                  {p.status === 'confirmed' && (
                    <Text style={styles.amountText}>{fmtRp(nominal)}</Text>
                  )}
                </View>
              </View>
            );
          })}

          {/* Period subtotal */}
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Total terkumpul periode {period.period_number}</Text>
            <Text style={styles.subtotalValue}>{fmtRp(period.total_collected)}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

export function BukuArisanScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [data, setData] = useState<BukuArisan | null>(null);
  const [hutang, setHutang] = useState<HutangInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token || !isOnline) { setLoading(false); return; }
    try {
      const [buku, hutangData] = await Promise.allSettled([
        getBukuArisan(token, groupId),
        getHutangInfo(token, groupId),
      ]);
      if (buku.status === 'fulfilled') setData(buku.value);
      if (hutangData.status === 'fulfilled') setHutang(hutangData.value);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat buku kas.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, groupId, isOnline]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = () => { setRefreshing(true); load(true); };

  const summary = data?.summary;
  const isKetua = data?.group.is_ketua ?? false;

  const handleResolveKabur = (debtor: HutangInfo['debtors'][number]) => {
    Alert.alert(
      `⚠ Hutang ${debtor.name}`,
      `${debtor.name} menang periode ${debtor.won_period} tapi masih punya hutang Rp ${debtor.total_hutang.toLocaleString('id')} (${debtor.detail.length} periode belum bayar).\n\nPilih cara penyelesaian:`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kick + Catat Kerugian',
          style: 'destructive',
          onPress: () => confirmResolve(debtor, 'kick_writeoff'),
        },
        {
          text: 'Netting (Hutang Saling Hapus)',
          onPress: () => confirmResolve(debtor, 'netting'),
        },
      ]
    );
  };

  const confirmResolve = (debtor: HutangInfo['debtors'][number], mode: 'kick_writeoff' | 'netting') => {
    const modeLabel = mode === 'kick_writeoff'
      ? 'Anggota dikeluarkan, kerugian dicatat di buku'
      : 'Hutang di-netting — pemenang berikutnya terima lebih sedikit';
    Alert.alert(
      'Konfirmasi',
      modeLabel + `. Total: Rp ${debtor.total_hutang.toLocaleString('id')}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setResolvingId(debtor.user_id);
            try {
              await resolveKabur(token, groupId, debtor.user_id, mode);
              Alert.alert('Berhasil', 'Hutang berhasil diselesaikan.');
              load();
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal menyelesaikan hutang.');
            } finally {
              setResolvingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Buku Kas Arisan" onBack={() => navigation.goBack()} />

      {loading ? (
        <ScrollView contentContainerStyle={styles.body}>
          <SkeletonBar height={88} borderRadius={12} style={{ marginBottom: 12 }} />
          {[0, 1, 2].map((i) => (
            <SkeletonBar key={i} height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </ScrollView>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* Summary Card */}
          {summary && (
            <Card accent tint pad={16} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{data?.group.name ?? groupName}</Text>
              <Text style={styles.summarySub}>
                {fmtRp(data?.group.nominal ?? 0)}/periode · {data?.group.total_periods ?? 0} periode
              </Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmtRp(summary.total_collected)}</Text>
                  <Text style={styles.statLabel}>Total terkumpul</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{fmtRp(summary.total_expected)}</Text>
                  <Text style={styles.statLabel}>Target total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: summary.collection_rate >= 80 ? Colors.primary : '#B45309' }]}>
                    {summary.collection_rate}%
                  </Text>
                  <Text style={styles.statLabel}>Terkumpul</Text>
                </View>
              </View>
              {/* Overall progress */}
              <View style={styles.overallProgress}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${summary.collection_rate}%` as any }]} />
                </View>
              </View>
            </Card>
          )}

          {/* Hutang / Kabur Warning — hanya ketua yang lihat */}
          {isKetua && hutang && hutang.debtors.length > 0 && (
            <Card style={styles.hutangCard}>
              <View style={styles.hutangHeader}>
                <Text style={styles.hutangTitle}>⚠ Peringatan: Anggota Menang & Kabur</Text>
                {hutang.impact_per_winner > 0 && (
                  <Text style={styles.hutangImpact}>
                    Pemenang berikutnya akan terima Rp {hutang.actual_per_winner.toLocaleString('id')} dari seharusnya Rp {hutang.expected_per_winner.toLocaleString('id')}
                  </Text>
                )}
              </View>
              {hutang.debtors.map((d) => (
                <TouchableOpacity
                  key={d.user_id}
                  style={styles.debtorRow}
                  onPress={() => handleResolveKabur(d)}
                  disabled={resolvingId === d.user_id}
                >
                  <View style={styles.debtorAvatar}>
                    <Text style={styles.debtorAvatarText}>{d.name[0]?.toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.debtorName}>{d.name}</Text>
                    <Text style={styles.debtorSub}>
                      Menang P{d.won_period} · Hutang {d.detail.length} periode
                    </Text>
                  </View>
                  <View style={styles.debtorRight}>
                    <Text style={styles.debtorAmount}>Rp {d.total_hutang.toLocaleString('id')}</Text>
                    <Text style={styles.debtorAction}>Selesaikan →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}

          {/* Member giliran summary */}
          {(data?.members.length ?? 0) > 0 && (
            <Card pad={12} style={styles.memberSummary}>
              <Text style={styles.sectionTitle}>Daftar Anggota & Giliran</Text>
              {data!.members.map((m, i) => {
                const wonPeriod = data!.periods.find((p) => p.winner?.user_id === m.user_id);
                return (
                  <View key={m.user_id} style={[styles.memberRow, i < data!.members.length - 1 && styles.memberBorder]}>
                    <View style={styles.slotBadge}>
                      <Text style={styles.slotBadgeText}>{m.slot_order ?? '—'}</Text>
                    </View>
                    <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                    {wonPeriod ? (
                      <View style={styles.wonBadge}>
                        <Text style={styles.wonBadgeText}>Menang P{wonPeriod.period_number}</Text>
                      </View>
                    ) : (
                      <Text style={styles.notYetText}>Belum</Text>
                    )}
                  </View>
                );
              })}
            </Card>
          )}

          {/* Per-period cards */}
          <Text style={styles.sectionHeader}>Catatan Per Periode</Text>
          {(data?.periods ?? []).map((p) => (
            <PeriodCard key={p.period_id} period={p} nominal={data?.group.nominal ?? 0} />
          ))}

          {(!data?.periods.length) && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada periode yang tercatat.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  flex: { flex: 1 },

  // Summary
  summaryCard: { gap: 6 },
  summaryTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 17, color: Colors.ink, fontWeight: '600' },
  summarySub: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginBottom: 4 },
  summaryStats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.primaryInk, fontWeight: '700' },
  statLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border, marginHorizontal: 4 },
  overallProgress: { marginTop: 10 },

  // Member summary
  memberSummary: {},
  sectionTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink, fontWeight: '600', marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  slotBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  slotBadgeText: { fontFamily: Fonts.displaySemiBold, fontSize: 12, color: Colors.primaryInk, fontWeight: '700' },
  memberName: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: Colors.ink },
  wonBadge: { backgroundColor: Colors.primaryTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  wonBadgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.primaryInk, fontWeight: '600' },
  notYetText: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },

  // Period cards
  sectionHeader: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.muted, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  periodCard: { gap: 0, overflow: 'hidden' },
  periodHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  periodHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  periodHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  periodBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  periodBadgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, fontWeight: '600' },
  periodTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.ink, fontWeight: '600' },
  periodCollected: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.primaryInk, fontWeight: '600' },
  chevron: { fontSize: 10, color: Colors.muted },

  periodMeta: { paddingHorizontal: 14, paddingBottom: 10, gap: 4 },
  metaText: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  progressTrack: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
  progressLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 11.5, color: Colors.ink, fontWeight: '600', flexShrink: 0 },

  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 10, backgroundColor: Colors.primaryTint, borderRadius: 10, padding: 10 },
  winnerIcon: { fontSize: 20 },
  winnerName: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.primaryInk, fontWeight: '600' },
  winnerSub: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.primaryInk, marginTop: 1 },

  // Payment list
  paymentList: { paddingHorizontal: 14, paddingBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },
  paymentListTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.muted, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  paymentBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarWinner: { backgroundColor: Colors.primaryTint },
  avatarText: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.muted, fontWeight: '700' },
  avatarTextWinner: { color: Colors.primaryInk },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  paymentName: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.ink, fontWeight: '600' },
  winnerPill: { backgroundColor: Colors.primaryTint, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  winnerPillText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.primaryInk, fontWeight: '600' },
  slotText: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.muted },
  confirmedBy: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: Colors.muted, marginTop: 2 },
  paymentRight: { alignItems: 'flex-end', gap: 2 },
  statusPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusPillText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, fontWeight: '600' },
  amountText: { fontFamily: Fonts.bodySemiBold, fontSize: 11.5, color: Colors.primaryInk, fontWeight: '600' },

  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  subtotalLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, flex: 1 },
  subtotalValue: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: Colors.primaryInk, fontWeight: '700' },

  // Hutang / kabur warning
  hutangCard: { borderWidth: 1.5, borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  hutangHeader: { marginBottom: 10 },
  hutangTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: '#B91C1C', fontWeight: '700', marginBottom: 4 },
  hutangImpact: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: '#7F1D1D', lineHeight: 17 },
  debtorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#FECACA' },
  debtorAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FCA5A5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  debtorAvatarText: { fontFamily: Fonts.displaySemiBold, fontSize: 14, color: '#B91C1C', fontWeight: '700' },
  debtorName: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: '#7F1D1D', fontWeight: '600' },
  debtorSub: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: '#B91C1C', marginTop: 1 },
  debtorRight: { alignItems: 'flex-end', gap: 2 },
  debtorAmount: { fontFamily: Fonts.displaySemiBold, fontSize: 13, color: '#B91C1C', fontWeight: '700' },
  debtorAction: { fontFamily: Fonts.bodyRegular, fontSize: 11, color: '#B91C1C' },

  // Error / empty
  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontWeight: '600', fontSize: 14 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted },
});
