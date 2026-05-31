import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Icon } from '../../components/ui/Icon';
import { StateView } from '../../components/ui/StateView';
import { useAuth } from '../../hooks/useAuth';
import { getActivityLog, ActivityLogEntry } from '../../api/chat';

type Props = NativeStackScreenProps<AppStackParamList, 'ActivityLog'>;

const LIMIT = 30;

const TONE_BG: Record<string, string> = {
  mint: Colors.primaryTint,
  blue: '#EAF2FF',
  neutral: Colors.surface,
  amber: Colors.amberTint,
};
const TONE_FG: Record<string, string> = {
  mint: Colors.primaryInk,
  blue: '#2D6FD6',
  neutral: Colors.mutedStrong,
  amber: Colors.amberInk,
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} · ${hh}:${mm}`;
}

export function ActivityLogScreen({ navigation, route }: Props) {
  const { groupId, groupName } = route.params;
  const { token } = useAuth();

  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getActivityLog(token, groupId, LIMIT, 0);
      setEntries(res.entries);
      setHasMore(res.has_more);
    } catch {
      setError('Gagal memuat log aktivitas. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  const loadMore = useCallback(async () => {
    if (!token || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getActivityLog(token, groupId, LIMIT, entries.length);
      setEntries((prev) => [...prev, ...res.entries]);
      setHasMore(res.has_more);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [token, groupId, hasMore, loadingMore, entries.length]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
        <StateView
          icon="activity"
          tone="neutral"
          title="Belum ada aktivitas"
          body="Semua aksi penting akan tercatat di sini secara permanen."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.note}>
            <Icon name="lock" size={14} color={Colors.muted} />
            <Text style={styles.noteText}>Aktivitas tercatat permanen — tidak bisa diubah atau dihapus</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
            : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: TONE_BG[item.tone] ?? Colors.surface }]}>
              <Icon name={item.icon} size={21} color={TONE_FG[item.tone] ?? Colors.mutedStrong} />
            </View>
            <View style={styles.content}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white, fontWeight: '600' },
  list: { paddingHorizontal: 22, paddingBottom: 32 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 4 },
  noteText: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, alignItems: 'flex-start' },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  content: { flex: 1 },
  text: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.ink, lineHeight: 20, fontWeight: '500' },
  timestamp: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, marginTop: 3 },
  separator: { height: 1, backgroundColor: Colors.border },
});
