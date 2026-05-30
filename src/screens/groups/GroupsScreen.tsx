import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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
import { getMyGroups, Group } from '../../api/groups';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Grup'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function GroupsScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getMyGroups(token)
      .then((data) => { setGroups(data); cache.set(CACHE_KEYS.GROUPS_LIST, data); })
      .catch(async () => {
        const cached = await cache.get<Group[]>(CACHE_KEYS.GROUPS_LIST);
        if (cached) setGroups(cached.data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = groups; // TODO: filter by role when API supports it

  if (!loading && groups.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
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
    <SafeAreaView style={styles.safe}>
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
      <ScrollView contentContainerStyle={styles.body}>
        <Segmented
          options={['Semua', 'Sebagai ketua', 'Anggota']}
          value={filter}
          onChange={setFilter}
        />
        <View style={styles.list}>
          {filtered.map((g) => (
            <GrupCard
              key={g.id}
              name={g.name}
              initial={g.name[0]}
              members={0}
              nominal={`Rp ${g.nominal.toLocaleString('id')}`}
              periode="Periode 1"
              due={3}
              onPress={() => navigation.navigate('GroupDetail', { groupId: g.id, groupName: g.name })}
            />
          ))}
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
