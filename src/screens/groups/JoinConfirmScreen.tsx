import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ListRow } from '../../components/ui/ListRow';
import { useAuth } from '../../hooks/useAuth';
import { getGroupByCode, joinGroup, Group } from '../../api/groups';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinConfirm'>;

export function JoinConfirmScreen({ navigation, route }: Props) {
  const { code } = route.params;
  const { token, user } = useAuth();
  const [group, setGroup] = useState<(Group & { member_count: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getGroupByCode(token, code)
      .then(setGroup)
      .catch((e) => setError(e.message ?? 'Kode tidak valid.'))
      .finally(() => setLoading(false));
  }, [code, token]);

  const handleJoin = async () => {
    if (!token || !group) return;
    if (!user?.name) {
      Alert.alert(
        'Lengkapi profil dulu',
        'Kamu perlu mengisi nama sebelum bergabung ke grup arisan.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Isi Nama', onPress: () => (navigation as any).navigate('Profil') },
        ],
      );
      return;
    }
    setJoining(true);
    try {
      await joinGroup(token, code);
      (navigation as any).navigate('GroupDetail', { groupId: group.id, groupName: group.name });
    } catch (e: any) {
      setError(e.message ?? 'Gagal bergabung.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Konfirmasi Gabung" onBack={() => navigation.goBack()} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Konfirmasi Gabung" onBack={() => navigation.goBack()} />
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error || 'Grup tidak ditemukan.'}</Text>
          <Btn size="md" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>Kembali</Btn>
        </View>
      </SafeAreaView>
    );
  }

  const ROWS = [
    ['Iuran / periode', `Rp ${group.nominal.toLocaleString('id')}`],
    ['Frekuensi', group.frequency === 'monthly' ? 'Bulanan' : group.frequency === 'weekly' ? 'Mingguan' : '2 Minggu'],
    ['Total periode', `${group.total_periods} ${group.frequency === 'weekly' ? 'minggu' : 'bulan'}`],
    ['Mode undian', group.draw_mode === 'random' ? 'Acak per periode' : group.draw_mode === 'fixed' ? 'Urutan tetap' : 'Offline'],
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Konfirmasi Gabung" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.preTitle}>Kamu akan bergabung ke:</Text>
          <Card accent tint pad={18}>
            <View style={styles.groupHeader}>
              <View style={styles.groupIcon}>
                <Icon name="users" size={26} color={Colors.white} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>{group.member_count} anggota</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.rowsCard} pad={6}>
            {ROWS.map(([k, v], i) => (
              <ListRow
                key={k}
                title={k}
                lastChild={i === ROWS.length - 1}
                right={<Text style={styles.rowVal}>{v}</Text>}
              />
            ))}
          </Card>

          <View style={styles.warning}>
            <Icon name="alert" size={20} color={Colors.amberInk} />
            <Text style={styles.warningText}>
              Dengan gabung, kamu berkomitmen bayar Rp {group.nominal.toLocaleString('id')} setiap periode selama {group.total_periods} periode.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.btnRow}>
          <Btn variant="outline" size="lg" onPress={() => navigation.goBack()} style={styles.flex}>
            Batal
          </Btn>
          <Btn size="lg" onPress={handleJoin} loading={joining} style={[styles.flex, styles.flex2]}>
            Gabung Grup
          </Btn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  flex2: { flex: 2 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preTitle: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: Colors.muted, marginBottom: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  groupIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 14, elevation: 6 },
  groupName: { fontFamily: Fonts.displaySemiBold, fontSize: 19, color: Colors.ink, fontWeight: '600' },
  groupMeta: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginTop: 2 },
  rowsCard: { marginTop: 14 },
  rowVal: { fontFamily: Fonts.displaySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, backgroundColor: Colors.amberTint, borderRadius: 16, padding: 14, marginTop: 14 },
  warningText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.amberInk, lineHeight: 19 },
  errorText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.danger, marginTop: 12, textAlign: 'center', fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
});
