import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Icon } from '../../components/ui/Icon';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { AnggotaItem } from '../../components/AnggotaItem';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useAuth } from '../../hooks/useAuth';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getGroupDetail, GroupDetail } from '../../api/groups';
import { cache } from '../../utils/cache';

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

export function DetailGrupScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();
  const isOnline = useNetworkStatus();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    try {
      if (token && isOnline) {
        const data = await getGroupDetail(token, groupId);
        setGroup(data);
        await cache.set(`group_detail_${groupId}`, data);
      } else {
        const cached = await cache.get<GroupDetail>(`group_detail_${groupId}`);
        if (cached) setGroup(cached.data);
      }
    } catch {
      const cached = await cache.get<GroupDetail>(`group_detail_${groupId}`);
      if (cached) setGroup(cached.data);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [groupId]);

  const onRefresh = () => { setRefreshing(true); load(true); };

  const mockMembers = group?.members ?? [];

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
              {mockMembers.length} anggota · Rp {(group?.nominal ?? 0).toLocaleString('id')} · Bulanan
            </Text>
          </View>
          <Pill tone="solid">Ketua</Pill>
        </View>

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
              <Text style={styles.progressLabel}>0 / {mockMembers.length || 12}</Text>
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
                if (a.screen === 'Bayar') navigation.navigate('Bayar', { groupId, periodId: 'p1', periodNumber: 1 });
                else if (a.screen === 'Chat') navigation.navigate('Chat', { groupId, groupName, memberCount: mockMembers.length });
                else if (a.screen === 'RequestSwap') navigation.navigate('RequestSwap', { groupId, myPeriod: 1 });
                else if (a.screen === 'UndianPre') navigation.navigate('UndianPre', { groupId, periodId: 'p1', periodNumber: 1 });
              }}
              style={[styles.quickBtn, 'primary' in a && a.primary && styles.quickBtnPrimary]}
              disabled={!isOnline && 'primary' in a && a.primary}
            >
              <Icon name={a.icon} size={22} color={'primary' in a && a.primary ? Colors.white : Colors.ink} strokeWidth={2} />
              <Text style={[styles.quickLabel, 'primary' in a && a.primary && styles.quickLabelPrimary]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Member Status */}
        <View style={styles.section}>
          <SectionLabel
            right={
              <Text style={styles.seeAll} onPress={() => navigation.navigate('Bayar', { groupId, periodId: 'p1', periodNumber: 1 })}>
                Kelola
              </Text>
            }
          >
            Status bayar periode {group?.current_period ?? 1}
          </SectionLabel>
          <Card>
            <View style={styles.memberGrid}>
              {(mockMembers.length > 0 ? mockMembers : Array(8).fill({ user: { name: '?' }, id: '' })).map((m, i) => (
                <AnggotaItem
                  key={i}
                  name={m.user?.name ?? `A${i + 1}`}
                  status="belum"
                  isMe={i === 0}
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
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: { flex: 1, borderRadius: 16, padding: 13, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  quickBtnPrimary: { backgroundColor: Colors.primary, borderWidth: 0, shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6 },
  quickLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.ink, fontWeight: '600' },
  quickLabelPrimary: { color: Colors.white },
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
