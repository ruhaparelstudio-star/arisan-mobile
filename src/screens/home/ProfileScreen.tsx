import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { ListRow } from '../../components/ui/ListRow';
import { useAuth } from '../../hooks/useAuth';
import { deleteAccount } from '../../api/auth';

type Props = BottomTabScreenProps<MainTabParamList, 'Profil'>;

const MENU = [
  { icon: 'bank', title: 'Rekening bank', value: '', onPress: undefined as (() => void) | undefined },
  { icon: 'bell', title: 'Pengaturan notifikasi', value: '', onPress: undefined as (() => void) | undefined },
  { icon: 'lock', title: 'Keamanan & PIN', value: '', onPress: undefined as (() => void) | undefined },
  { icon: 'activity', title: 'Riwayat semua arisan', value: '', onPress: undefined as (() => void) | undefined },
  { icon: 'shield', title: 'Bantuan & dukungan', value: '', onPress: undefined as (() => void) | undefined },
  { icon: 'fileText', title: 'Kebijakan Privasi', value: '', onPress: () => PRIVACY_POLICY_URL && Linking.openURL(PRIVACY_POLICY_URL) },
];

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, token } = useAuth();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun',
      'Data kamu akan dianonimkan sesuai UU PDP. Kamu tidak bisa login lagi setelah ini.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjutkan',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Konfirmasi Final',
              'Yakin ingin menghapus akun? Aksi ini tidak bisa dibatalkan.',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Ya, Hapus Akun Saya',
                  style: 'destructive',
                  onPress: async () => {
                    if (!token) return;
                    setDeletingAccount(true);
                    try {
                      await deleteAccount(token);
                      await logout();
                    } catch (e: any) {
                      Alert.alert('Gagal', e.message ?? 'Gagal menghapus akun. Coba lagi.');
                    } finally {
                      setDeletingAccount(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        large
        title="Profil"
        right={
          <View style={styles.settingsBtn}>
            <Icon name="settings" size={21} color={Colors.ink} />
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.profileRow}>
          <Avatar name={user?.name ?? user?.phone ?? 'U'} size={68} mint />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'Pengguna'}</Text>
            <Text style={styles.profilePhone}>{user?.phone}</Text>
            <Pill tone="mint" dot style={styles.badge}>
              Anggota aktif
            </Pill>
          </View>
        </View>

        <Card tint pad={18} style={styles.statsCard}>
          <View style={styles.statsRow}>
            {[
              ['0', 'Grup'],
              ['Rp 0', 'Total iuran'],
              ['0×', 'Menang'],
            ].map(([n, l], i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card pad={6} style={styles.menuCard}>
          {MENU.map(({ icon, title, value, onPress }, i) => (
            <ListRow
              key={i}
              icon={icon}
              title={title}
              lastChild={i === MENU.length - 1}
              onPress={onPress}
              right={
                <View style={styles.menuRight}>
                  {value ? <Text style={styles.menuValue}>{value}</Text> : null}
                  <Icon name="chevronRight" size={18} color={Colors.muted} />
                </View>
              }
            />
          ))}
        </Card>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="logout" size={19} color={Colors.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={deletingAccount}
          style={[styles.deleteBtn, deletingAccount && styles.deleteBtnDisabled]}
        >
          <Icon name="trash" size={16} color={Colors.muted} />
          <Text style={styles.deleteText}>{deletingAccount ? 'Menghapus...' : 'Hapus Akun'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
  settingsBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4, marginBottom: 8 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: Fonts.displaySemiBold, fontSize: 21, color: Colors.ink, letterSpacing: -0.3, fontWeight: '600' },
  profilePhone: { fontFamily: Fonts.bodyRegular, fontSize: 13.5, color: Colors.muted, marginTop: 2 },
  badge: { marginTop: 7 },
  statsCard: { marginTop: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.primaryInk, fontWeight: '600' },
  statLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 2 },
  menuCard: { marginTop: 16 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuValue: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, color: Colors.danger, padding: 12, marginTop: 18 },
  logoutText: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.danger, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, marginTop: 4, marginBottom: 8 },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteText: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted },
});
