import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Icon } from '../../components/ui/Icon';
import { StateView } from '../../components/ui/StateView';

type Props = NativeStackScreenProps<AppStackParamList, 'ActivityLog'>;

type Activity = { id: string; icon: string; tone: string; text: string; timestamp: string };

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', icon: 'checkCircle', tone: 'mint', text: 'Ketua konfirmasi bayar Sari', timestamp: '15 Jun 2026 · 14:32 WIB' },
  { id: '2', icon: 'sparkles', tone: 'mint', text: 'Undian periode 4 — Andi Pratama menang', timestamp: '14 Jun 2026 · 20:00 WIB' },
  { id: '3', icon: 'swap', tone: 'blue', text: 'Ketua approve tukar giliran Rina ↔ Doni', timestamp: '14 Jun 2026 · 17:30 WIB' },
  { id: '4', icon: 'checkCircle', tone: 'mint', text: 'Ketua konfirmasi bayar Budi, Gita, Rina', timestamp: '13 Jun 2026 · 10:14 WIB' },
  { id: '5', icon: 'users', tone: 'neutral', text: 'Doni bergabung ke grup', timestamp: '1 Mar 2026 · 09:00 WIB' },
];

const TONE_BG: Record<string, string> = { mint: Colors.primaryTint, blue: '#EAF2FF', neutral: Colors.surface, amber: Colors.amberTint };
const TONE_FG: Record<string, string> = { mint: Colors.primaryInk, blue: '#2D6FD6', neutral: Colors.mutedStrong, amber: Colors.amberInk };

export function ActivityLogScreen({ navigation, route }: Props) {
  const { groupName } = route.params;

  if (MOCK_ACTIVITIES.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
        <StateView icon="activity" tone="neutral" title="Belum ada aktivitas" body="Semua aksi penting akan tercatat di sini secara permanen." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar title="Log Aktivitas" sub={groupName} onBack={() => navigation.goBack()} />
      <FlatList
        data={MOCK_ACTIVITIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.note}>
            <Icon name="lock" size={14} color={Colors.muted} />
            <Text style={styles.noteText}>Aktivitas tercatat permanen — tidak bisa diubah atau dihapus</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: TONE_BG[item.tone] ?? Colors.surface }]}>
              <Icon name={item.icon} size={21} color={TONE_FG[item.tone] ?? Colors.mutedStrong} />
            </View>
            <View style={styles.content}>
              <Text style={styles.text}>{item.text}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
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
