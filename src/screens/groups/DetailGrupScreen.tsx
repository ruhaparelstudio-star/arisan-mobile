import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
  RefreshControl, Alert, Share, Clipboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { AnggotaItem } from '../../components/AnggotaItem';
import { OfflineBanner } from '../../components/OfflineBanner';
import { SkeletonBar } from '../../components/ui/SkeletonBar';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, GroupDetail, generateInvite, leaveGroup, disbandGroup } from '../../api/groups';
import { cache, CACHE_KEYS } from '../../utils/cache';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupDetail'>;

const QUICK_ACTIONS = [
  { icon: 'wallet', label: 'Bayar', primary: true, screen: 'Bayar' as const },
  { icon: 'message', label: 'Chat', screen: 'Chat' as const },
  { icon: 'swap', label: 'Tukar', screen: 'RequestSwap' as const },
  { icon: 'sparkles', label: 'Undian', screen: 'UndianPre' as const },
] as const;

const ACTIVITY_MOCK = [
  { icon: 'checkCircle', tone: 'mint', text: 'Konfirmasi bayar anggota', when: '14:32' },
  { icon: 'sparkles', tone: 'mint', text: 'Undian periode baru', when: 'Kemarin' },
  { icon: 'swap', tone: 'blue', text: 'Request tukar giliran', when: '8 Jun' },
];

function fmtLastUpdated(d: Date): string {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ', ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function DetailGrupScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token, user } = useAuth();
  const isOnline = useNetworkStatus();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isKetua = !!group && !!user && group.created_by === user.id;

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (token && isOnline) {
        const data = await getGroupDetail(token, groupId);
        setGroup(data);
        setLastUpdated(new Date());
        await cache.set(CACHE_KEYS.groupDetail(groupId), data);
      } else {
        const cached = await cache.get<GroupDetail>(CACHE_KEYS.groupDetail(groupId));
        if (cached) {
          setGroup(cached.data);
          setLastUpdated(new Date());
        }
      }
    } catch {
      const cached = await cache.get<GroupDetail>(CACHE_KEYS.groupDetail(groupId));
      if (cached) {
        setGroup(cached.data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [token, groupId, isOnline]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const handleGenerateInvite = async () => {
    if (!token) return;
    setActionLoading(true);
    try {
      const { invite_code } = await generateInvite(token, groupId);
      navigation.navigate('Invite', { groupId, inviteCode: invite_code, groupName: group?.name ?? groupName });
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Gagal generate kode invite.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Keluar Grup',
      `Yakin mau keluar dari "${group?.name ?? groupName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              await leaveGroup(token, groupId);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal keluar dari grup.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDisband = () => {
    Alert.alert(
      'Bubarkan Grup',
      `Yakin mau membubarkan "${group?.name ?? groupName}"? Aksi ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Bubarkan',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              await disbandGroup(token, groupId);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Gagal', e.message ?? 'Gagal membubarkan grup.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const members = group?.members ?? [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBar onBack={() => navigation.goBack()} title="Detail Grup" />
        <ScrollView contentContainerStyle={styles.body}>
          {/* identity skeleton */}
          <View style={[styles.identity, { marginBottom: 16 }]}>
            <SkeletonBar width={52} height={52} borderRadius={16} />
            <View style={styles.flex}>
              <SkeletonBar width="55%" height={14} style={{ marginBottom: 9 }} />
              <SkeletonBar width="70%" height={11} />
            </View>
          </View>
          {/* status card skeleton */}
          <SkeletonBar height={112} borderRadius={12} style={{ marginBottom: 16 }} />
          {/* quick actions skeleton */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBar key={i} style={{ flex: 1 }} height={72} borderRadius={16} />
            ))}
          </View>
          {/* section header skeleton */}
          <SkeletonBar width={160} height={13} style={{ marginBottom: 12 }} />
          {/* member grid skeleton */}
          <Card>
            <View style={styles.memberGrid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonBar key={i} width={58} height={70} borderRadius={14} />
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar
        onBack={() => navigation.goBack()}
        title="Detail Grup"
        right={
          <View style={styles.menuBtn}>
            <Icon name="grip" size={20} color={Colors.ink} />
          </View>
        }
      />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.groupAvatar}>
            <Text style={styles.groupInitial}>{groupName[0]}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.groupName}>{group?.name ?? groupName}</Text>
            <Text style={styles.groupMeta}>
              {members.length} anggota · Rp {(group?.nominal ?? 0).toLocaleString('id')} · Bulanan
            </Text>
          </View>
          {isKetua && <Pill tone="solid">Ketua</Pill>}
        </View>

        {/* Invite Code (recruiting) */}
        {group?.status === 'recruiting' && (
          <Card accent tint pad={16} style={styles.inviteCard}>
            <View style={styles.inviteRow}>
              <View style={styles.flex}>
                <Text style={styles.inviteLabel}>KODE INVITE</Text>
                <Text style={styles.inviteCode}>{group.invite_code}</Text>
              </View>
              <View style={styles.inviteBtns}>
                <TouchableOpacity
                  onPress={() => Clipboard.setString(group.invite_code)}
                  style={styles.inviteBtn}
                  disabled={!isOnline}
                >
                  <Icon name="copy" size={18} color={Colors.primaryInk} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Share.share({ message: `Gabung arisan "${group.name}" pakai kode: ${group.invite_code}` })}
                  style={styles.inviteBtn}
                  disabled={!isOnline}
                >
                  <Icon name="share" size={18} color={Colors.primaryInk} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Status Hero */}
        <Card accent tint pad={18} style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View>
              <Text style={styles.periodeLabel}>PERIODE {group?.current_period ?? 1} DARI {group?.total_periods ?? 12}</Text>
              <View style={styles.winnerRow}>
                <Icon name="trophy" size={18} color={Colors.primaryInk} />
                <Text style={styles.winnerText}>Pemenang: —</Text>
              </View>
            </View>
            <View style={styles.dueWrap}>
              <Text style={styles.dueLabel}>Jatuh tempo</Text>
              <Text style={styles.dueDate}>— · H-?</Text>
            </View>
          </View>
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Sudah bayar</Text>
              <Text style={styles.progressLabel}>0 / {members.length || 12}</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => {
                if (a.screen === 'Bayar') navigation.navigate('Bayar', { groupId, periodId: group?.current_period_id ?? '', periodNumber: group?.current_period ?? 1 });
                else if (a.screen === 'Chat') navigation.navigate('Chat', { groupId, groupName, memberCount: members.length, ketuaId: group?.created_by ?? '' });
                else if (a.screen === 'RequestSwap') navigation.navigate('RequestSwap', { groupId, myPeriod: 1 });
                else if (a.screen === 'UndianPre') navigation.navigate('UndianPre', { groupId, periodId: group?.current_period_id ?? '', periodNumber: group?.current_period ?? 1, isKetua });
              }}
              style={[styles.quickBtn, 'primary' in a && a.primary && styles.quickBtnPrimary]}
              disabled={!isOnline && 'primary' in a && a.primary}
            >
              <Icon name={a.icon} size={22} color={'primary' in a && a.primary ? Colors.white : Colors.ink} strokeWidth={2} />
              <Text style={[styles.quickLabel, 'primary' in a && a.primary && styles.quickLabelPrimary]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ketua Actions */}
        {isKetua && (
          <View style={styles.ketuaActions}>
            <Btn
              full size="md" variant="outline" icon="users"
              onPress={() => navigation.navigate('SetGiliran', { groupId, members: members.map(m => ({ id: m.user_id, name: m.user.name ?? m.user.phone, slot_order: m.slot_order })) })}
              disabled={!isOnline || actionLoading}
              style={styles.ketuaBtn}
            >
              Set Giliran
            </Btn>
            <Btn
              full size="md" variant="outline" icon="share"
              onPress={handleGenerateInvite}
              disabled={!isOnline || actionLoading}
              style={styles.ketuaBtn}
            >
              Generate Invite Baru
            </Btn>
            <Btn
              full size="md" variant="outline" icon="alert"
              onPress={handleDisband}
              disabled={!isOnline || actionLoading}
              style={[styles.ketuaBtn, styles.destructiveBtn]}
              textStyle={{ color: Colors.danger }}
            >
              Bubarkan Grup
            </Btn>
          </View>
        )}

        {/* Anggota Action */}
        {!isKetua && group && (
          <Btn
            full size="md" variant="outline"
            onPress={handleLeave}
            disabled={!isOnline || actionLoading}
            style={[styles.leaveBtn]}
            textStyle={{ color: Colors.danger }}
          >
            Keluar Grup
          </Btn>
        )}

        {/* Offline tooltip untuk aksi kritis */}
        {!isOnline && (
          <Text style={styles.offlineHint}>Butuh koneksi internet untuk melakukan aksi ini.</Text>
        )}

        {/* Stale label */}
        {!isOnline && lastUpdated && (
          <Text style={styles.staleLabel}>
            Data terakhir diperbarui: {fmtLastUpdated(lastUpdated)}
          </Text>
        )}

        {/* Member Status */}
        <View style={styles.section}>
          <SectionLabel
            right={
              <Text style={styles.seeAll} onPress={() => navigation.navigate('Bayar', { groupId, periodId: group?.current_period_id ?? '', periodNumber: group?.current_period ?? 1 })}>
                Kelola
              </Text>
            }
          >
            Status bayar periode {group?.current_period ?? 1}
          </SectionLabel>
          <Card>
            <View style={styles.memberGrid}>
              {(members.length > 0 ? members : Array(8).fill({ user: { name: '?' }, id: '' })).map((m, i) => (
                <AnggotaItem
                  key={i}
                  name={m.user?.name ?? `A${i + 1}`}
                  status="belum"
                  isMe={m.user_id === user?.id}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <SectionLabel right={<Text style={styles.seeAll} onPress={() => navigation.navigate('ActivityLog', { groupId, groupName })}>Semua</Text>}>
            Aktivitas terbaru
          </SectionLabel>
          <Card pad={6}>
            {ACTIVITY_MOCK.map((a, i) => (
              <View key={i} style={[styles.actRow, i < ACTIVITY_MOCK.length - 1 && styles.actBorder]}>
                <View style={[styles.actIcon, { backgroundColor: a.tone === 'mint' ? Colors.primaryTint : a.tone === 'blue' ? '#EAF2FF' : Colors.surface }]}>
                  <Icon name={a.icon} size={21} color={a.tone === 'mint' ? Colors.primaryInk : a.tone === 'blue' ? '#2D6FD6' : Colors.mutedStrong} />
                </View>
                <Text style={styles.actText}>{a.text}</Text>
                <Text style={styles.actWhen}>{a.when}</Text>
              </View>
            ))}
          </Card>
          <View style={styles.immutableNote}>
            <Icon name="lock" size={13} color={Colors.muted} />
            <Text style={styles.immutableText}>Aktivitas tercatat permanen — tidak bisa diubah</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 32 },
  flex: { flex: 1 },
  menuBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
  groupAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  groupInitial: { fontFamily: Fonts.displaySemiBold, fontSize: 22, color: Colors.primaryInk, fontWeight: '600' },
  groupName: { fontFamily: Fonts.displaySemiBold, fontSize: 19, color: Colors.ink, letterSpacing: -0.3, fontWeight: '600' },
  groupMeta: { fontFamily: Fonts.bodyRegular, fontSize: 13, color: Colors.muted, marginTop: 1 },
  inviteCard: { marginBottom: 14 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inviteLabel: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.muted, letterSpacing: 1, fontWeight: '700' },
  inviteCode: { fontFamily: Fonts.displaySemiBold, fontSize: 26, color: Colors.ink, letterSpacing: 4, marginTop: 2, fontWeight: '600' },
  inviteBtns: { flexDirection: 'row', gap: 8 },
  inviteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  statusCard: { marginBottom: 16 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  periodeLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted, fontWeight: '700', letterSpacing: 0.3 },
  winnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  winnerText: { fontFamily: Fonts.displaySemiBold, fontSize: 18, color: Colors.ink, fontWeight: '600' },
  dueWrap: { alignItems: 'flex-end' },
  dueLabel: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  dueDate: { fontFamily: Fonts.displaySemiBold, fontSize: 15, color: Colors.amberInk, marginTop: 3, fontWeight: '600' },
  progressWrap: { marginTop: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.mutedStrong, fontWeight: '600' },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(0,168,126,0.18)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, borderRadius: 16, padding: 13, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  quickBtnPrimary: { backgroundColor: Colors.primary, borderWidth: 0, shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  quickLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600' },
  quickLabelPrimary: { color: Colors.white },
  ketuaActions: { gap: 8, marginBottom: 8 },
  ketuaBtn: { borderColor: Colors.border },
  destructiveBtn: { borderColor: Colors.dangerTint },
  leaveBtn: { borderColor: Colors.dangerTint, marginBottom: 8 },
  offlineHint: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  staleLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 22 },
  seeAll: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.primaryInk, fontWeight: '600' },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actRow: { flexDirection: 'row', gap: 12, padding: 11, alignItems: 'center' },
  actBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  actIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actText: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 13.5, color: Colors.ink, fontWeight: '500' },
  actWhen: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  immutableNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 },
  immutableText: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
});
