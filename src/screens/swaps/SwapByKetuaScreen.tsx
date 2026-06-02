import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { Pill } from '../../components/ui/Pill';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { LoadingView } from '../../components/ui/LoadingView';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, GroupMember } from '../../api/groups';
import { swapsApi } from '../../api/swaps';

type Props = NativeStackScreenProps<AppStackParamList, 'SwapByKetua'>;

export function SwapByKetuaScreen({ navigation, route }: Props) {
  const { groupId, groupName, winnerId, winnerName } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedA, setSelectedA] = useState<GroupMember | null>(null);
  const [selectedB, setSelectedB] = useState<GroupMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getGroupDetail(token, groupId);
      setMembers(data.members);
      // Pre-select winner sebagai member A jika ada
      if (winnerId) {
        const winner = data.members.find((m) => m.user_id === winnerId);
        if (winner) setSelectedA(winner);
      }
    } catch (e: any) {
      setLoadError(e.message ?? 'Gagal memuat anggota.');
    } finally {
      setLoading(false);
    }
  }, [token, groupId, winnerId]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = (member: GroupMember) => {
    if (selectedA?.user_id === member.user_id) {
      setSelectedA(null);
      return;
    }
    if (selectedB?.user_id === member.user_id) {
      setSelectedB(null);
      return;
    }
    if (!selectedA) {
      setSelectedA(member);
    } else if (!selectedB) {
      setSelectedB(member);
    }
  };

  const handleSubmit = async () => {
    if (!token || !selectedA || !selectedB) return;
    setSubmitting(true);
    try {
      await swapsApi.requestAsKetua(selectedA.user_id, selectedB.user_id, groupId, token);
      Alert.alert(
        'Request Tukar Dikirim',
        `Request tukar giliran antara ${selectedA.user.name ?? selectedA.user.phone} dan ${selectedB.user.name ?? selectedB.user.phone} sudah dikirim. Menunggu persetujuan anggota.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Gagal mengirim request tukar. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Tukar Giliran (Ketua)" onBack={() => navigation.goBack()} />
        <LoadingView icon="swap" title="Memuat anggota..." />
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Tukar Giliran (Ketua)" onBack={() => navigation.goBack()} />
        <StateView icon="swap" tone="danger" title="Gagal memuat" body={loadError} primary="Coba Lagi" onPrimary={load} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Tukar Giliran (Ketua)" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.h1}>Pilih dua anggota untuk ditukar giliran</Text>
          <Text style={styles.sub}>
            Sebagai ketua, kamu bisa menukar giliran dua anggota secara langsung. Kedua anggota akan menerima notifikasi untuk menyetujui.
          </Text>

          {winnerName && (
            <View style={styles.infoBox}>
              <Icon name="trophy" size={18} color={Colors.primaryInk} />
              <Text style={styles.infoText}>
                Pemenang periode ini ({winnerName}) sudah dipilih sebagai Anggota A. Pilih Anggota B yang mau ditukar.
              </Text>
            </View>
          )}

          {/* Pilihan aktif */}
          {(selectedA || selectedB) && (
            <Card pad={14} style={styles.selectionCard}>
              <SectionLabel>Pilihan saat ini</SectionLabel>
              <View style={styles.selectionRow}>
                <View style={styles.selectionItem}>
                  <Text style={styles.selectionLabel}>Anggota A</Text>
                  {selectedA ? (
                    <View style={styles.selectedMember}>
                      <Avatar name={selectedA.user.name ?? selectedA.user.phone} size={32} />
                      <Text style={styles.selectedName} numberOfLines={1}>
                        {selectedA.user.name ?? selectedA.user.phone}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectionEmpty}>Belum dipilih</Text>
                  )}
                </View>
                <Icon name="swap" size={20} color={Colors.muted} />
                <View style={styles.selectionItem}>
                  <Text style={styles.selectionLabel}>Anggota B</Text>
                  {selectedB ? (
                    <View style={styles.selectedMember}>
                      <Avatar name={selectedB.user.name ?? selectedB.user.phone} size={32} />
                      <Text style={styles.selectedName} numberOfLines={1}>
                        {selectedB.user.name ?? selectedB.user.phone}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectionEmpty}>Belum dipilih</Text>
                  )}
                </View>
              </View>
            </Card>
          )}

          <Card pad={6} style={styles.memberList}>
            <SectionLabel>{members.length} anggota</SectionLabel>
            {members.map((m) => {
              const name = m.user.name ?? m.user.phone;
              const isA = selectedA?.user_id === m.user_id;
              const isB = selectedB?.user_id === m.user_id;
              const isSelected = isA || isB;
              return (
                <TouchableOpacity
                  key={m.user_id}
                  style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                  onPress={() => handleSelect(m)}
                  disabled={!isOnline}
                >
                  <Avatar name={name} size={40} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{name}</Text>
                    <Text style={styles.memberSlot}>
                      Slot urutan: {m.slot_order ?? '—'}
                      {m.swap_count > 0 ? ` · Sudah tukar ${m.swap_count}x` : ''}
                    </Text>
                  </View>
                  {isA && <Pill tone="solid">A</Pill>}
                  {isB && <Pill tone="mint">B</Pill>}
                  {isSelected && <Icon name="checkCircle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </Card>
        </View>

        <View>
          {!isOnline && (
            <Text style={styles.offlineNote}>Butuh koneksi internet untuk melakukan aksi ini</Text>
          )}
          <Btn
            full size="lg" icon="swap"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!isOnline || !selectedA || !selectedB || submitting}
            style={styles.cta}
          >
            Kirim Request Tukar
          </Btn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  h1: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.ink, fontWeight: '600', letterSpacing: -0.3, marginTop: 6 },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, lineHeight: 21, marginTop: 8, marginBottom: 14 },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.primaryTint, borderRadius: 12, padding: 12, marginBottom: 14 },
  infoText: { flex: 1, fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.primaryInk, lineHeight: 18 },
  selectionCard: { marginBottom: 14 },
  selectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  selectionItem: { flex: 1, alignItems: 'center', gap: 6 },
  selectionLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.muted, fontWeight: '600', letterSpacing: 0.5 },
  selectedMember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedName: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink, fontWeight: '600', flex: 1 },
  selectionEmpty: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, fontStyle: 'italic' },
  memberList: { marginBottom: 20 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10 },
  memberRowSelected: { backgroundColor: Colors.primaryTint },
  memberInfo: { flex: 1 },
  memberName: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  memberSlot: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 2 },
  cta: {},
  offlineNote: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginBottom: 8 },
});
