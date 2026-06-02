import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Btn } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { updateMe, deleteAccount, getUserStats, UserStats } from '../../api/auth';

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? '';

type Props = BottomTabScreenProps<MainTabParamList, 'Profil'>;

function comingSoon() {
  Alert.alert('Segera hadir', 'Fitur ini sedang dalam pengembangan.');
}

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, token, updateUser } = useAuth();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Edit nama state
  const [editVisible, setEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!token) return;
    getUserStats(token)
      .then(setStats)
      .catch(() => setStats({ group_count: 0, total_iuran: 0, win_count: 0 }));
  }, [token]);

  const openEditName = () => {
    setNameInput(user?.name ?? '');
    setNameError('');
    setEditVisible(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Nama tidak boleh kosong.');
      return;
    }
    if (!token) return;
    setSavingName(true);
    setNameError('');
    try {
      await updateMe(token, { name: trimmed });
      await updateUser({ name: trimmed });
      setEditVisible(false);
    } catch (e: any) {
      setNameError(e.message ?? 'Gagal menyimpan nama. Coba lagi.');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Keluar', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
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

  const MENU = [
    { icon: 'bank', title: 'Rekening bank', value: '', onPress: comingSoon },
    { icon: 'bell', title: 'Pengaturan notifikasi', value: '', onPress: comingSoon },
    { icon: 'lock', title: 'Keamanan & PIN', value: '', onPress: comingSoon },
    { icon: 'activity', title: 'Riwayat semua arisan', value: (stats?.group_count ?? 0) > 0 ? `${stats!.group_count} grup` : '', onPress: comingSoon },
    { icon: 'shield', title: 'Bantuan & dukungan', value: '', onPress: comingSoon },
    {
      icon: 'fileText',
      title: 'Kebijakan Privasi',
      value: '',
      onPress: () => PRIVACY_POLICY_URL ? Linking.openURL(PRIVACY_POLICY_URL) : comingSoon(),
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        large
        title="Profil"
        right={
          <TouchableOpacity style={styles.settingsBtn} onPress={comingSoon}>
            <Icon name="settings" size={21} color={Colors.ink} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Profile row */}
        <View style={styles.profileRow}>
          <Avatar name={user?.name ?? user?.phone ?? 'U'} size={68} mint />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{user?.name ?? 'Pengguna'}</Text>
              <TouchableOpacity onPress={openEditName} style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="edit" size={16} color={Colors.primaryInk} />
              </TouchableOpacity>
            </View>
            <Text style={styles.profilePhone}>{user?.phone}</Text>
            <Pill tone="mint" dot style={styles.badge}>
              {stats && stats.group_count > 0 ? `Ketua / anggota ${stats.group_count} grup` : 'Anggota aktif'}
            </Pill>
          </View>
        </View>

        {/* Stats */}
        <Card tint pad={18} style={styles.statsCard}>
          <View style={styles.statsRow}>
            {[
              [stats != null ? String(stats.group_count) : '—', 'Grup'],
              [stats != null ? `Rp ${stats.total_iuran.toLocaleString('id')}` : '—', 'Total iuran'],
              [stats != null ? `${stats.win_count}×` : '—', 'Menang'],
            ].map(([n, l], i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Menu */}
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

      {/* Edit Nama Modal */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => !savingName && setEditVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Nama</Text>
            <TextInput
              style={[styles.nameInput, nameError ? styles.nameInputError : null]}
              value={nameInput}
              onChangeText={(t) => { setNameInput(t); setNameError(''); }}
              placeholder="Nama lengkap kamu"
              placeholderTextColor={Colors.muted}
              autoFocus
              maxLength={60}
            />
            {nameError ? <Text style={styles.nameErrorText}>{nameError}</Text> : null}
            <View style={styles.modalBtns}>
              <Btn
                variant="outline"
                size="md"
                onPress={() => setEditVisible(false)}
                disabled={savingName}
                style={styles.modalBtnHalf}
              >
                Batal
              </Btn>
              <Btn
                size="md"
                onPress={handleSaveName}
                loading={savingName}
                disabled={savingName}
                style={styles.modalBtnHalf}
              >
                Simpan
              </Btn>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
  settingsBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4, marginBottom: 8 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontFamily: Fonts.displaySemiBold, fontSize: 21, color: Colors.ink, letterSpacing: -0.3, fontWeight: '600', flexShrink: 1 },
  editBtn: { padding: 2 },
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
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginTop: 18 },
  logoutText: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.danger, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, marginTop: 4, marginBottom: 8 },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteText: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: Colors.bg, borderRadius: 20, padding: 24 },
  modalTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 18, color: Colors.ink, fontWeight: '600', marginBottom: 16 },
  nameInput: { height: 48, borderWidth: 1.5, borderRadius: 7, borderColor: Colors.border, paddingHorizontal: 14, fontFamily: Fonts.bodyRegular, fontSize: 15, color: Colors.ink },
  nameInputError: { borderColor: Colors.danger },
  nameErrorText: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.danger, marginTop: 6 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtnHalf: { flex: 1 },
});
