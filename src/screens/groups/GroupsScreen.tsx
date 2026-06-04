import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { AppBar } from '../../components/ui/AppBar';
import { Segmented } from '../../components/ui/Segmented';
import { GrupCard } from '../../components/GrupCard';
import { StateView } from '../../components/ui/StateView';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getMyGroups, getGroupDetail, Group, GroupDetail } from '../../api/groups';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Grup'>,
  NativeStackScreenProps<AppStackParamList>
>;

interface RichGroup {
  base: Group;
  detail: GroupDetail | null;
}

function formatNominal(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n.toLocaleString('id')}`;
}

export function GroupsScreen({ navigation }: Props) {
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();
  const [groups, setGroups] = useState<RichGroup[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;

    // Offline: langsung ke cache tanpa tunggu 15s timeout
    if (!isOnline) {
      const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
      if (cached) setGroups(cached.data.map((g) => ({ base: g, detail: null })));
      setLoading(false);
      if (isRefresh) setRefreshing(false);
      return;
    }

    try {
      const list = await getMyGroups(token);
      cache.set(CACHE_KEYS.GROUPS_LIST, list);

      // Cache-first: baca detail dari cache dulu, fetch hanya yang stale/kosong
      const cachedDetails = await Promise.all(
        list.map((g) => cache.get<GroupDetail>(CACHE_KEYS.groupDetail(g.id))),
      );

      // Tampilkan data cache langsung agar UI responsif
      setGroups(list.map((g, i) => ({ base: g, detail: cachedDetails[i]?.data ?? null })));
      setLoading(false);
      if (isRefresh) setRefreshing(false);

      // Fetch hanya grup yang cache-nya stale atau kosong (background refresh)
      const needsFresh = list.filter((_, i) => !cachedDetails[i] || cachedDetails[i]!.isStale);
      if (needsFresh.length > 0) {
        const freshDetails = await Promise.all(
          needsFresh.map((g) => getGroupDetail(token, g.id).catch((err) => { console.warn('GroupsScreen: background detail refresh failed', g.id, err); return null; })),
        );
        setGroups((prev) => {
          const next = [...prev];
          needsFresh.forEach((g, idx) => {
            const pos = list.findIndex((l) => l.id === g.id);
            if (pos >= 0) next[pos] = { base: g, detail: freshDetails[idx] };
          });
          return next;
        });
      }
    } catch {
      const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
      if (cached) setGroups(cached.data.map((g) => ({ base: g, detail: null })));
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, isOnline]);

  // NEW-P1-1: hanya useFocusEffect — cover initial mount + setiap kembali ke screen
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(true); };

  const checkName = useCallback((action: () => void) => {
    if (user?.name) {
      action();
    } else {
      Alert.alert(
        'Lengkapi profil dulu',
        'Kamu perlu mengisi nama sebelum membuat atau bergabung ke grup arisan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Isi Nama', onPress: () => navigation.navigate('Profil') },
        ],
      );
    }
  }, [user?.name, navigation]);

  const filtered = groups.filter((g) => {
    if (filter === 'Sebagai ketua') return g.base.created_by === user?.id;
    if (filter === 'Anggota') return g.base.created_by !== user?.id;
    return true;
  });

  if (!loading && groups.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar large title="Grup kamu" />
        <StateView
          icon="users"
          tone="mint"
          title="Belum ada grup arisan"
          body="Buat grup baru sebagai ketua, atau gabung pakai kode undangan."
          primary="Buat grup pertama"
          onPrimary={() => checkName(() => navigation.navigate('BuatGrupStep1'))}
          secondary="Punya kode? Gabung di sini"
          onSecondary={() => checkName(() => navigation.navigate('JoinGrup'))}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        large
        title="Grup kamu"
        right={
          <TouchableOpacity
            onPress={() => checkName(() => navigation.navigate('BuatGrupStep1'))}
            style={styles.addBtn}
          >
            <Icon name="plus" size={22} color={Colors.white} strokeWidth={2.2} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Segmented
          options={['Semua', 'Sebagai ketua', 'Anggota']}
          value={filter}
          onChange={setFilter}
        />
        <View style={styles.list}>
          {filtered.map(({ base: g, detail }) => {
            const memberCount = detail?.members.length ?? 0;
            const currentPeriod = detail?.current_period;
            const periodeLabel = currentPeriod
              ? `Periode ${currentPeriod} / ${g.total_periods}`
              : g.status === 'completed'
              ? `${g.total_periods} periode selesai`
              : 'Belum dimulai';
            const role = g.created_by === user?.id ? 'Ketua' : undefined;
            // NEW-P2-1: due date aktual tidak tersedia di list — tampil null ("Aktif") bukan hardcoded H-3
            const due: number | 'paid' | null = g.status === 'completed' ? 'paid' : null;
            return (
              <GrupCard
                key={g.id}
                name={g.name}
                initial={g.name[0]}
                members={memberCount}
                nominal={formatNominal(g.nominal)}
                periode={periodeLabel}
                due={due}
                role={role}
                onPress={() => navigation.navigate('GroupDetail', { groupId: g.id, groupName: g.name })}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 24 },
  addBtn: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  list: { marginTop: 16 },
});
