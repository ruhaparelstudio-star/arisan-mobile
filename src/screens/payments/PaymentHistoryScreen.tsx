import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getPayments, getPeriods, Payment, Period } from '../../api/payments';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentHistory'>;

function fmtDue(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function PaymentHistoryScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment[]>>({});
  const [loadingPeriod, setLoadingPeriod] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await getPeriods(token, groupId);
      // sort terbaru dulu
      const sorted = [...data].sort((a, b) => b.period_number - a.period_number);
      setPeriods(sorted);
    } catch {
      setError('Gagal memuat riwayat pembayaran. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  const handleExpand = useCallback(async (p: Period) => {
    if (expanded === p.id) {
      setExpanded(null);
      return;
    }
    setExpanded(p.id);
    if (paymentsMap[p.id] || !token) return;
    setLoadingPeriod(p.id);
    try {
      const data = await getPayments(token, groupId, p.id);
      setPaymentsMap((prev) => ({ ...prev, [p.id]: data }));
    } catch {
      // silently fail; user can retry by collapsing and re-expanding
    } finally {
      setLoadingPeriod(null);
    }
  }, [expanded, paymentsMap, token, groupId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppBar title="Riwayat Pembayaran" sub={groupName} onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPeriods} style={styles.retryBtn}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : periods.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Belum ada periode pembayaran.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {periods.map((p) => {
            const isOpen = expanded === p.id;
            const members = paymentsMap[p.id] ?? [];
            const paid = members.filter((m) => m.status === 'confirmed').length;

            return (
              <Card key={p.id} pad={0} style={styles.accordion}>
                {/* Accordion header */}
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => handleExpand(p)}
                  activeOpacity={0.75}
                >
                  <View style={styles.flex}>
                    <View style={styles.headerTop}>
                      <Text style={styles.periodTitle}>Periode {p.period_number}</Text>
                      <Pill
                        tone={p.status === 'closed' ? 'mint' : p.status === 'active' ? 'amber' : 'neutral'}
                        dot
                      >
                        {p.status === 'closed' ? 'Selesai' : p.status === 'active' ? 'Aktif' : 'Mendatang'}
                      </Pill>
                    </View>
                    <Text style={styles.periodSub}>
                      Jatuh tempo: {fmtDue(p.due_date)}
                    </Text>
                    {members.length > 0 && (
                      <Text style={styles.periodPaid}>
                        {paid}/{members.length} anggota lunas
                      </Text>
                    )}
                  </View>
                  <Icon
                    name={isOpen ? 'chevronUp' : 'chevronDown'}
                    size={18}
                    color={Colors.muted}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* Accordion body */}
                {isOpen && (
                  <View style={styles.accordionBody}>
                    {loadingPeriod === p.id ? (
                      <ActivityIndicator color={Colors.primary} style={styles.loadingRow} />
                    ) : members.length === 0 ? (
                      <Text style={styles.noMemberText}>Belum ada data anggota.</Text>
                    ) : (
                      members.map((m, i) => (
                        <View
                          key={m.user_id}
                          style={[styles.memberRow, i < members.length - 1 && styles.memberBorder]}
                        >
                          <Avatar name={m.user.name ?? m.user.phone} size={32} />
                          <View style={styles.flex}>
                            <Text style={styles.memberName}>{m.user.name ?? m.user.phone}</Text>
                          </View>
                          <MemberStatusBadge status={m.status} />
                        </View>
                      ))
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MemberStatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'confirmed') {
    return (
      <View style={mb.confirmed}>
        <Text style={mb.confirmedText}>✓ Lunas</Text>
      </View>
    );
  }
  if (status === 'late') {
    return (
      <View style={mb.late}>
        <Text style={mb.lateText}>⚠ Telat</Text>
      </View>
    );
  }
  return (
    <View style={mb.pending}>
      <Text style={mb.pendingText}>⏰ Belum</Text>
    </View>
  );
}

const mb = StyleSheet.create({
  confirmed: { backgroundColor: Colors.primaryTint, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  confirmedText: { color: Colors.primaryInk, fontFamily: Fonts.bodySemiBold, fontSize: 11, fontWeight: '600' },
  late: { backgroundColor: Colors.dangerTint, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  lateText: { color: Colors.danger, fontFamily: Fonts.bodySemiBold, fontSize: 11, fontWeight: '600' },
  pending: { backgroundColor: Colors.surface, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: 11, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  body: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  flex: { flex: 1 },

  accordion: { overflow: 'hidden' },
  accordionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  periodTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 15.5, color: Colors.ink, fontWeight: '600' },
  periodSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted },
  periodPaid: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, color: Colors.primaryInk, fontWeight: '600', marginTop: 2 },

  accordionBody: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  loadingRow: { marginVertical: 16 },
  noMemberText: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, textAlign: 'center', paddingVertical: 16 },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  memberName: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.ink, fontWeight: '600' },

  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: Colors.white, fontFamily: Fonts.bodySemiBold, fontWeight: '600', fontSize: 14 },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, textAlign: 'center' },
});
