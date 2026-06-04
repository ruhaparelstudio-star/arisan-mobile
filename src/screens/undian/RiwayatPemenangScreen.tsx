import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
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
import { undianApi, Winner } from '../../api/undian';
import { getGroupDetail } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'RiwayatPemenang'>;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function RiwayatPemenangScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();

  const [winners, setWinners] = useState<Winner[]>([]);
  const [arisanAmount, setArisanAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [res, group] = await Promise.all([
        undianApi.getHistory(groupId, token),
        getGroupDetail(token, groupId),
      ]);
      const sorted = [...res.winners].sort((a, b) => b.period_number - a.period_number);
      setWinners(sorted);
      // Hitung nominal × jumlah anggota sebagai fallback karena backend belum kirim arisan_amount
      setArisanAmount(group.nominal * group.members.length);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat riwayat pemenang. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Riwayat Pemenang" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Riwayat Pemenang" onBack={() => navigation.goBack()} />
        <StateView
          icon="trophy"
          tone="danger"
          title="Gagal memuat"
          body={error}
          primary="Coba Lagi"
          onPrimary={() => load()}
        />
      </SafeAreaView>
    );
  }

  if (winners.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Riwayat Pemenang" onBack={() => navigation.goBack()} />
        <StateView
          icon="trophy"
          tone="neutral"
          title="Belum ada pemenang"
          body="Riwayat pemenang akan muncul di sini setelah undian pertama dilakukan."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Riwayat Pemenang" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.subtitle}>{groupName}</Text>

        <Card pad={6} style={styles.card}>
          {winners.map((w, i) => (
            <View
              key={w.id}
              style={[styles.row, i < winners.length - 1 && styles.rowBorder]}
            >
              <View style={styles.periodBadge}>
                <Text style={styles.periodNum}>{w.period_number}</Text>
              </View>
              <Avatar name={w.winner_name} size={40} />
              <View style={styles.info}>
                <Text style={styles.name}>{w.winner_name}</Text>
                <Text style={styles.date}>{formatDate(w.drawn_at)}</Text>
              </View>
              {(w.arisan_amount > 0 || arisanAmount > 0) && (
                <Pill tone="mint">
                  Rp {((w.arisan_amount > 0 ? w.arisan_amount : arisanAmount) / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt
                </Pill>
              )}
            </View>
          ))}
        </Card>

        <View style={styles.immutableNote}>
          <Icon name="lock" size={13} color={Colors.muted} />
          <Text style={styles.immutableText}>Daftar pemenang permanen — tidak bisa diubah</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  subtitle: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginBottom: 14 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  periodBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  periodNum: { fontFamily: Fonts.displaySemiBold, fontSize: 13, color: Colors.mutedStrong, fontWeight: '600' },
  info: { flex: 1 },
  name: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  date: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 1 },
  immutableNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 8 },
  immutableText: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
});
