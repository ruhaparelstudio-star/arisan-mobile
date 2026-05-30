import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

function formatNominal(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1).replace('.', ',')}jt`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`;
  return n.toLocaleString('id');
}

function groupStatusPill(status: string) {
  switch (status) {
    case 'active': return { tone: 'amber' as const, label: 'Aktif', dot: true };
    case 'completed': return { tone: 'mint' as const, label: 'Selesai', dot: false };
    case 'recruiting': return { tone: 'neutral' as const, label: 'Rekrut', dot: true };
    default: return { tone: 'neutral' as const, label: status, dot: false };
  }
}
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ListRow } from '../../components/ui/ListRow';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SkeletonBar } from '../../components/ui/SkeletonBar';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getMyGroups, Group } from '../../api/groups';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Beranda'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadGroups = useCallback(async (isRefresh = false) => {
    try {
      if (isOnline && token) {
        const data = await getMyGroups(token);
        setGroups(data);
        setLastUpdated(new Date());
        await cache.set(CACHE_KEYS.GROUPS_LIST, data);
      } else {
        const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
        if (cached) {
          setGroups(cached.data);
          setLastUpdated(new Date());
        }
      }
    } catch {
      const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
      if (cached) {
        setGroups(cached.data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, isOnline]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const onRefresh = () => { setRefreshing(true); loadGroups(true); };

  const urgentGroup = groups[0];

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar large title="Beranda" />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.heroSkeleton} />
          <View style={styles.skeletonRow}>
            <SkeletonBar width={100} height={13} />
            <SkeletonBar width={70} height={13} />
          </View>
          <Card pad={6}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.skeletonItem, i < 2 && styles.skeletonBorder]}>
                <SkeletonBar width={46} height={46} borderRadius={14} />
                <View style={styles.flex}>
                  <SkeletonBar width="65%" height={13} style={{ marginBottom: 8 }} />
                  <SkeletonBar width="40%" height={11} />
                </View>
                <SkeletonBar width={48} height={22} borderRadius={11} />
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        large
        title="Beranda"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifikasi' as any)}
            style={styles.bellBtn}
          >
            <Icon name="bell" size={21} color={Colors.ink} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        }
      />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Icon name="users" size={42} color={Colors.primaryInk} strokeWidth={1.7} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada grup arisan</Text>
            <Text style={styles.emptySub}>
              Buat grup baru sebagai ketua, atau gabung grup yang sudah ada pakai kode undangan.
            </Text>
          </View>
        ) : (
          <>
            {urgentGroup && (
              <View style={styles.hero}>
                <View style={styles.heroCircle1} />
                <View style={styles.heroCircle2} />
                <View style={styles.heroLabel}>
                  <Icon name="clock" size={15} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroLabelText}>PERLU PERHATIAN</Text>
                </View>
                <Text style={styles.heroTitle}>Bayar {urgentGroup.name}</Text>
                <Text style={styles.heroSub}>
                  Rp {urgentGroup.nominal.toLocaleString('id')} · jatuh tempo 2 hari lagi
                </Text>
                <View style={styles.heroActions}>
                  <Btn
                    size="sm"
                    variant="soft"
                    onPress={() => navigation.navigate('GroupDetail', { groupId: urgentGroup.id, groupName: urgentGroup.name })}
                    style={styles.heroOutlineBtn}
                    textStyle={styles.heroOutlineBtnText}
                  >
                    Lihat detail
                  </Btn>
                  <Btn
                    size="sm"
                    variant="primary"
                    style={styles.paidBtn}
                    textStyle={{ color: Colors.white, fontWeight: '700' }}
                  >
                    Sudah bayar
                  </Btn>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <SectionLabel
                right={
                  <Text
                    style={styles.seeAll}
                    onPress={() => navigation.navigate('Grup' as any)}
                  >
                    Lihat semua
                  </Text>
                }
              >
                Grup aktif
              </SectionLabel>
              <Card pad={6}>
                {groups.slice(0, 3).map((g, i) => (
                  <ListRow
                    key={g.id}
                    leading={
                      <View style={styles.groupIcon}>
                        <Text style={styles.groupInitial}>{g.name[0]}</Text>
                      </View>
                    }
                    title={g.name}
                    sub={`${g.total_periods} periode · Rp ${formatNominal(g.nominal)}`}
                    onPress={() => navigation.navigate('GroupDetail', { groupId: g.id, groupName: g.name })}
                    lastChild={i === Math.min(groups.length, 3) - 1}
                    right={(() => { const p = groupStatusPill(g.status); return <Pill tone={p.tone} dot={p.dot}>{p.label}</Pill>; })()}
                  />
                ))}
              </Card>
            </View>
          </>
        )}

        <View style={styles.ctaRow}>
          <Btn
            size="md"
            icon="plus"
            onPress={() => navigation.navigate('BuatGrupStep1')}
            disabled={!isOnline}
            style={styles.flex}
          >
            Buat grup
          </Btn>
          <Btn
            size="md"
            variant="outline"
            onPress={() => navigation.navigate('JoinGrup')}
            disabled={!isOnline}
            style={styles.flex}
          >
            Gabung kode
          </Btn>
        </View>
        {!isOnline && (
          <Text style={styles.offlineHint}>Butuh koneksi internet untuk melakukan aksi ini.</Text>
        )}
        {!isOnline && lastUpdated && (
          <Text style={styles.staleLabel}>
            Data terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}, {lastUpdated.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 24, gap: 0 },
  flex: { flex: 1 },
  bellBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: 9, right: 10, width: 8, height: 8,
    borderRadius: 4, backgroundColor: Colors.amber, borderWidth: 1.5, borderColor: Colors.surface,
  },
  hero: {
    borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden',
    backgroundColor: Colors.primary, marginBottom: 24,
    shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 1, shadowRadius: 24, elevation: 12,
  },
  heroCircle1: {
    position: 'absolute', right: -30, top: -30, width: 140, height: 140,
    borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroCircle2: {
    position: 'absolute', right: 30, bottom: -50, width: 100, height: 100,
    borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroLabelText: { color: 'rgba(255,255,255,0.85)', fontSize: 11.5, fontWeight: '700', letterSpacing: 0.8, fontFamily: Fonts.displayBold, textTransform: 'uppercase' },
  heroTitle: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.white, lineHeight: 28, marginTop: 8, letterSpacing: -0.4, fontWeight: '700' },
  heroSub: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: 'rgba(255,255,255,0.88)', marginTop: 5 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroOutlineBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)' },
  heroOutlineBtnText: { color: Colors.white, fontWeight: '600' },
  paidBtn: { backgroundColor: Colors.primaryDeep, shadowColor: 'transparent', elevation: 0 },
  section: { marginBottom: 16 },
  seeAll: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.primaryInk, fontWeight: '600' },
  groupIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  groupInitial: { fontFamily: Fonts.displaySemiBold, fontSize: 18, color: Colors.primaryInk, fontWeight: '600' },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  offlineHint: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8 },
  staleLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, textAlign: 'center', marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontFamily: Fonts.displayBold, fontSize: 23, color: Colors.ink, letterSpacing: -0.4, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  emptySub: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, color: Colors.muted, lineHeight: 22, textAlign: 'center', maxWidth: 280 },
  heroSkeleton: { height: 150, borderRadius: 24, backgroundColor: Colors.surface, marginBottom: 24 },
  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  skeletonItem: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 2 },
  skeletonBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
});
