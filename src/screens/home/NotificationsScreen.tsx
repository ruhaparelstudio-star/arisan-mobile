import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Card } from '../../components/ui/Card';
import { Pill } from '../../components/ui/Pill';
import { Btn } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, markAllRead, Notification } from '../../api/notifications';

type Props = BottomTabScreenProps<MainTabParamList, 'Notifikasi'>;

const TONE_MAP: Record<string, string> = {
  payment_due: 'amber',
  winner: 'mint',
  swap_request: 'blue',
  confirmed: 'mint',
  member_join: 'neutral',
};
const ICON_MAP: Record<string, string> = {
  payment_due: 'wallet',
  winner: 'sparkles',
  swap_request: 'swap',
  confirmed: 'checkCircle',
  member_join: 'users',
};

function NotifIcon({ type }: { type: string }) {
  const tone = TONE_MAP[type] ?? 'neutral';
  const iconName = ICON_MAP[type] ?? 'bell';
  const bgMap: Record<string, string> = {
    amber: Colors.amberTint, mint: Colors.primaryTint, blue: '#EAF2FF', neutral: Colors.surface,
  };
  const fgMap: Record<string, string> = {
    amber: Colors.amberInk, mint: Colors.primaryInk, blue: '#2D6FD6', neutral: Colors.mutedStrong,
  };
  return (
    <View style={[styles.notifIcon, { backgroundColor: bgMap[tone] ?? Colors.surface }]}>
      <Icon name={iconName} size={21} color={fgMap[tone] ?? Colors.mutedStrong} />
    </View>
  );
}

export function NotificationsScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getNotifications(token)
      .then(setNotifs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleMarkAll = async () => {
    if (!token) return;
    await markAllRead(token).catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const unread = notifs.filter((n) => !n.read_at);
  const older = notifs.filter((n) => !!n.read_at);

  if (!loading && notifs.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBar large title="Notifikasi" />
        <StateView
          icon="bell"
          tone="neutral"
          title="Belum ada notifikasi"
          body="Pengingat bayar, hasil undian, dan request tukar giliran akan muncul di sini."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar
        large
        title="Notifikasi"
        right={
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markRead}>Tandai dibaca</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.body}>
        {unread.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>PERLU TINDAKAN</Text>
              <Pill tone="amber" style={styles.countPill}>{unread.length}</Pill>
            </View>
            <Card pad={6} style={styles.card}>
              {unread.map((n, i) => (
                <View key={n.id} style={[styles.notifRow, i < unread.length - 1 && styles.divider]}>
                  <NotifIcon type={n.type} />
                  <View style={styles.notifContent}>
                    <View style={styles.notifTopRow}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      <Text style={styles.notifWhen}>
                        {new Date(n.created_at).toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.notifBody}>{n.body}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        {older.length > 0 && (
          <>
            <Text style={styles.olderLabel}>SEBELUMNYA</Text>
            <Card pad={6}>
              {older.map((n, i) => (
                <View key={n.id} style={[styles.notifRow, i < older.length - 1 && styles.divider]}>
                  <NotifIcon type={n.type} />
                  <View style={styles.notifContent}>
                    <View style={styles.notifTopRow}>
                      <Text style={[styles.notifTitle, styles.notifTitleRead]}>{n.title}</Text>
                      <Text style={styles.notifWhen}>
                        {new Date(n.created_at).toLocaleDateString('id', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={styles.notifBody}>{n.body}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingHorizontal: 22, paddingBottom: 24 },
  markRead: { fontFamily: Fonts.bodySemiBold, color: Colors.primaryInk, fontSize: 13.5, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 },
  sectionLabel: { fontFamily: Fonts.bodyBold, fontSize: 12.5, color: Colors.amberInk, letterSpacing: 0.3, fontWeight: '700' },
  countPill: { fontSize: 11, paddingVertical: 1, paddingHorizontal: 8 },
  card: { marginBottom: 22 },
  notifRow: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1, minWidth: 0 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  notifTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 14.5, color: Colors.ink, fontWeight: '600', flex: 1 },
  notifTitleRead: { fontWeight: '400' as any, color: Colors.muted, fontFamily: Fonts.bodyRegular },
  notifWhen: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, flexShrink: 0 },
  notifBody: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, lineHeight: 18, marginTop: 2 },
  olderLabel: { fontFamily: Fonts.bodyBold, fontSize: 12.5, color: Colors.muted, letterSpacing: 0.3, marginBottom: 10, marginTop: 4, fontWeight: '700' },
});
