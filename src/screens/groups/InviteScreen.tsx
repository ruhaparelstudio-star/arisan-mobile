import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Btn } from '../../components/ui/Button';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { ListRow } from '../../components/ui/ListRow';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { getGroupDetail, GroupMember } from '../../api/groups';
import { undianApi } from '../../api/undian';

type Props = NativeStackScreenProps<AppStackParamList, 'Invite'>;

const POLL_MS = 10000;
const PLAYSTORE_URL = process.env.EXPO_PUBLIC_PLAYSTORE_URL ?? 'https://play.google.com/store/apps/details?id=com.ruhaparelstudio.arisan';

export function InviteScreen({ navigation, route }: Props) {
  const { groupId, inviteCode, groupName } = route.params;
  const { token, user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [totalPeriods, setTotalPeriods] = useState(0);
  const [drawMode, setDrawMode] = useState<'random' | 'fixed' | 'manual'>('random');
  const [currentPeriodId, setCurrentPeriodId] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null);
  const [groupActive, setGroupActive] = useState(false);
  const [hasWinner, setHasWinner] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!token) return;
    try {
      const [data, undianRes] = await Promise.all([
        getGroupDetail(token, groupId),
        undianApi.getHistory(groupId, token).catch(() => ({ winners: [] })),
      ]);
      setMembers(data.members);
      setTotalPeriods(data.total_periods);
      setDrawMode(data.draw_mode);
      setCurrentPeriodId(data.current_period_id);
      setCurrentPeriod(data.current_period);
      setGroupActive(data.status === 'active');
      setHasWinner(undianRes.winners.length > 0);
    } catch {
      // ignore poll errors silently
    }
  }, [token, groupId]);

  useEffect(() => {
    fetchMembers();
    intervalRef.current = setInterval(fetchMembers, POLL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchMembers]);

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
  };

  const WA_MESSAGE = `Halo! Aku undang kamu gabung arisan *${groupName}*.\n\nMasukkan kode ini di app Arisan:\n*${inviteCode}*\n\nDownload: ${PLAYSTORE_URL}`;

  const handleShare = async () => {
    const waUrl = `whatsapp://send?text=${encodeURIComponent(WA_MESSAGE)}`;
    const canOpen = await Linking.canOpenURL(waUrl);
    if (canOpen) {
      await Linking.openURL(waUrl);
    } else {
      await Share.share({ message: WA_MESSAGE });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Invite Anggota" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text style={styles.sub}>
            Bagikan kode ini — anggota gabung dengan memasukkannya di app.
          </Text>

          <Card accent tint pad={22} style={styles.codeCard}>
            <Text style={styles.codeLabel}>KODE INVITE</Text>
            <Text style={styles.code} testID="invite_code">{inviteCode}</Text>
            <Text style={styles.codeExpiry}>Berlaku sampai grup penuh atau periode 1 dimulai</Text>
          </Card>

          <View style={styles.actionRow}>
            <Btn variant="outline" size="md" icon="copy" onPress={handleCopy} style={styles.flex}>
              Salin kode
            </Btn>
            <Btn size="md" icon="share" onPress={handleShare} style={[styles.flex, styles.waBtn]} textStyle={styles.waBtnText}>
              WhatsApp
            </Btn>
          </View>

          <View style={styles.memberSection}>
            <SectionLabel right={<Pill tone="neutral">{members.length} / {totalPeriods || '?'}</Pill>}>
              Sudah bergabung
            </SectionLabel>
            <Card pad={6}>
              {members.length === 0 ? (
                <ListRow
                  leading={<Avatar name={user?.name ?? 'Kamu'} size={40} mint />}
                  title={user?.name ?? 'Kamu'}
                  sub="Ketua · menunggu anggota lain..."
                  lastChild
                  right={<Pill tone="solid">Ketua</Pill>}
                />
              ) : (
                members.map((m, i) => {
                  const isKetua = m.user_id === user?.id;
                  const name = m.user.name ?? m.user.phone;
                  return (
                    <ListRow
                      key={m.user_id}
                      leading={<Avatar name={name} size={40} mint={isKetua} />}
                      title={name}
                      sub={isKetua ? 'Ketua' : `Bergabung baru`}
                      lastChild={i === members.length - 1}
                      right={isKetua
                        ? <Pill tone="solid">Ketua</Pill>
                        : <Icon name="checkCircle" size={20} color={Colors.primary} />
                      }
                    />
                  );
                })
              )}
            </Card>
          </View>
        </View>

        {/* Mode 2 (random): prompt undian pertama — hanya tampil jika belum ada pemenang sama sekali */}
        {drawMode === 'random' && groupActive && currentPeriodId && !hasWinner && (
          <Card accent tint pad={16} style={styles.undianPrompt}>
            <View style={styles.undianPromptRow}>
              <Icon name="sparkles" size={22} color={Colors.primaryInk} />
              <View style={styles.flex}>
                <Text style={styles.undianPromptTitle}>Grup siap! Lakukan undian pertama</Text>
                <Text style={styles.undianPromptSub}>Ketua bisa langsung mengundi pemenang periode 1.</Text>
              </View>
            </View>
            <Btn
              full size="md" icon="sparkles"
              onPress={() => navigation.navigate('UndianPre', {
                groupId,
                periodId: currentPeriodId,
                periodNumber: currentPeriod ?? 1,
                isKetua: true,
              })}
              style={styles.undianPromptBtn}
            >
              Mulai Undian Pertama
            </Btn>
          </Card>
        )}

        <Btn
          full
          size="lg"
          variant="dark"
          onPress={() => navigation.navigate('GroupDetail', { groupId, groupName })}
          style={styles.cta}
        >
          Selesai → Lihat Grup
        </Btn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  body: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 24, justifyContent: 'space-between' },
  sub: { fontFamily: Fonts.bodyRegular, fontSize: 14.5, color: Colors.muted, lineHeight: 22, marginTop: 4 },
  codeCard: { marginTop: 18, alignItems: 'center' },
  codeLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.muted, letterSpacing: 2, fontWeight: '700' },
  code: { fontFamily: Fonts.displaySemiBold, fontSize: 42, color: Colors.ink, letterSpacing: 6, marginVertical: 10, fontWeight: '600' },
  codeExpiry: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  waBtn: { backgroundColor: '#25D366' },
  waBtnText: { color: '#FFFFFF' },
  memberSection: { marginTop: 24 },
  cta: { marginTop: 12 },
  undianPrompt: { marginTop: 16 },
  undianPromptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  undianPromptTitle: { fontFamily: Fonts.displaySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600' },
  undianPromptSub: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, marginTop: 2 },
  undianPromptBtn: {},
});
