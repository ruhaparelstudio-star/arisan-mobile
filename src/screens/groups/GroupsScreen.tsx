import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
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
  const [groups, setGroups] = useState<RichGroup[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    try {
      const list = await getMyGroups(token);
      cache.set(CACHE_KEYS.GROUPS_LIST, list);
      // Load details in parallel for member count and current period
      const details = await Promise.all(
        list.map((g) => getGroupDetail(token, g.id).catch(() => null)),
      );
      setGroups(list.map((g, i) => ({ base: g, detail: details[i] })));
    } catch {
      const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
      if (cached) setGroups(cached.data.map((g) => ({ base: g, detail: null })));
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

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
          onPrimary={() => navigation.navigate('BuatGrupStep1')}
          secondary="Punya kode? Gabung di sini"
          onSecondary={() => navigation.navigate('JoinGrup')}
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
            onPress={() => navigation.navigate('BuatGrupStep1')}
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
            const due: number | 'paid' = g.status === 'completed' ? 'paid' : 3;
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
