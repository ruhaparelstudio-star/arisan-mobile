import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
import { StateView } from '../../components/ui/StateView';
import { Btn } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, markAllRead, markRead, Notification } from '../../api/notifications';
import { triggerUnreadRefresh } from '../../hooks/useUnreadCount';

const CTA_MAP: Record<string, string> = {
  payment_due: 'Bayar',
  undian_done: 'Lihat',
  swap_request: 'Tinjau',
  swap_approved: 'Lihat',
};

type Props = BottomTabScreenProps<MainTabParamList, 'Notifikasi'>;

const TONE_MAP: Record<string, string> = {
  payment_confirmed: 'mint',
  payment_due: 'amber',
  undian_done: 'mint',
  swap_approved: 'blue',
  swap_request: 'blue',
  member_join: 'neutral',
};
const ICON_MAP: Record<string, string> = {
  payment_confirmed: 'checkCircle',
  payment_due: 'wallet',
  undian_done: 'sparkles',
  swap_approved: 'swap',
  swap_request: 'swap',
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await getNotifications(token);
      setNotifs(res.notifications);
    } catch {
      if (!silent) setError('Gagal memuat notifikasi. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Refresh saat screen difokus — menangkap notif baru yang masuk saat di screen lain
  useFocusEffect(useCallback(() => { load(true); }, [load]));

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const handleMarkAll = async () => {
    if (!token) return;
    await markAllRead(token).catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    triggerUnreadRefresh();
  };

  const handleMarkOne = async (id: string) => {
    if (!token) return;
    await markRead(token, id).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    triggerUnreadRefresh();
  };

  const unread = notifs.filter((n) => !n.is_read);
  const older = notifs.filter((n) => n.is_read);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar large title="Notifikasi" />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar large title="Notifikasi" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (notifs.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
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
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar
        large
        title="Notifikasi"
        right={
          unread.length > 0 ? (
            <TouchableOpacity onPress={handleMarkAll}>
              <Text style={styles.markRead}>Tandai dibaca</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {unread.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>PERLU TINDAKAN</Text>
              <Pill tone="amber" style={styles.countPill}>{unread.length}</Pill>
            </View>
            <Card pad={6} style={styles.card}>
              {unread.map((n, i) => {
                const cta = CTA_MAP[n.type];
                return (
                  <View
                    key={n.id}
                    style={[styles.notifRow, i < unread.length - 1 && styles.divider]}
                  >
                    <NotifIcon type={n.type} />
                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle}>{n.title}</Text>
                        <Text style={styles.notifWhen}>
                          {new Date(n.created_at).toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={styles.notifBody}>{n.body}</Text>
                      {cta ? (
                        <View style={styles.ctaWrap}>
                          <Btn
                            size="sm"
                            variant={i === 0 ? 'primary' : 'soft'}
                            onPress={() => handleMarkOne(n.id)}
                          >
                            {cta}
                          </Btn>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted },
  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white, fontWeight: '600' },
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
  notifTitleRead: { fontWeight: '400' as never, color: Colors.muted, fontFamily: Fonts.bodyRegular },
  notifWhen: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, flexShrink: 0 },
  notifBody: { fontFamily: Fonts.bodyRegular, fontSize: 12.5, color: Colors.muted, lineHeight: 18, marginTop: 2 },
  ctaWrap: { marginTop: 8 },
  olderLabel: { fontFamily: Fonts.bodyBold, fontSize: 12.5, color: Colors.muted, letterSpacing: 0.3, marginBottom: 10, marginTop: 4, fontWeight: '700' },
});
