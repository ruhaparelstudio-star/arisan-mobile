import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Segmented } from '../../components/ui/Segmented';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAuth } from '../../hooks/useAuth';
import { getMessages, sendMessage, ChatMessage } from '../../api/chat';

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

const POLL_INTERVAL_MS = 4000;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' });
}

function SkeletonBubble({ me }: { me?: boolean }) {
  return (
    <View style={[styles.msgRow, me && styles.msgRowMe]}>
      {!me && <View style={styles.skeletonAvatar} />}
      <View style={[styles.skeletonBubble, me && styles.skeletonBubbleMe]} />
    </View>
  );
}

export function ChatScreen({ navigation, route }: Props) {
  const { groupId, groupName, memberCount, ketuaId } = route.params;
  const { user, token } = useAuth();
  const isOnline = useNetworkStatus();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('Semua');

  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const newestIdRef = useRef<string | undefined>(undefined);

  const loadMessages = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const res = await getMessages(token, groupId, 30);
      setMessages(res.messages);
      setHasMore(res.has_more);
      if (res.messages.length > 0) newestIdRef.current = res.messages[0].id;
      setError(null);
    } catch {
      if (!silent) setError('Gagal memuat pesan. Coba lagi.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, groupId]);

  const loadMore = useCallback(async () => {
    if (!token || !hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[messages.length - 1].id;
      const res = await getMessages(token, groupId, 30, oldest);
      setMessages((prev) => [...prev, ...res.messages]);
      setHasMore(res.has_more);
    } catch {
      // silently fail for pagination
    } finally {
      setLoadingMore(false);
    }
  }, [token, groupId, hasMore, loadingMore, messages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!isOnline) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => loadMessages(true), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOnline, loadMessages]);

  const handleSend = async () => {
    if (!draft.trim() || !isOnline || !token || sending) return;
    const text = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const res = await sendMessage(token, groupId, text);
      setMessages((prev) => [res.message, ...prev]);
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === 'Semua') return true;
    if (filter === 'Sistem') return m.type === 'system';
    return m.type === 'user';
  });

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.sysRow}>
          <View style={styles.sysBubble}>
            <Icon name="sparkles" size={14} color={Colors.primaryInk} />
            <Text style={styles.sysText}>{item.text}</Text>
          </View>
        </View>
      );
    }
    const isMe = item.user_id === user?.id;
    const isKetua = item.user_id === ketuaId;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <Avatar name={item.user_name ?? '?'} size={28} />}
        <View style={[styles.bubble, isMe && styles.bubbleMe]}>
          {!isMe && (
            <View style={styles.senderRow}>
              <Text style={styles.senderName}>{item.user_name}</Text>
              {isKetua && (
                <View style={styles.ketuaBadge}>
                  <Text style={styles.ketuaLabel}>Ketua</Text>
                </View>
              )}
            </View>
          )}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppBar
        onBack={() => navigation.goBack()}
        title={groupName}
        sub={`${memberCount} anggota`}
        right={
          <View style={styles.infoBtn}>
            <Icon name="info" size={20} color={Colors.ink} />
          </View>
        }
      />
      <OfflineBanner />

      <TouchableOpacity style={styles.pinned} onPress={() => navigation.goBack()}>
        <Icon name="trophy" size={18} color={Colors.primaryInk} />
        <Text style={styles.pinnedText} numberOfLines={1}>Periode aktif · Tap untuk detail</Text>
        <Icon name="chevronRight" size={17} color={Colors.primaryInk} />
      </TouchableOpacity>

      <View style={styles.filterWrap}>
        <Segmented options={['Semua', 'Obrolan', 'Sistem']} value={filter} onChange={setFilter} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {loading ? (
          <View style={styles.skeletonList}>
            {[0, 1, 2, 3, 4].map((i) => <SkeletonBubble key={i} me={i % 2 === 0} />)}
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadMessages()} style={styles.retryBtn}>
              <Text style={styles.retryLabel}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={filtered}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.msgContent}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} /> : null}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>Belum ada pesan. Mulai ngobrol!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Icon name="plus" size={22} color={Colors.primaryInk} strokeWidth={2} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={isOnline ? 'Tulis pesan...' : 'Tidak bisa kirim pesan saat offline'}
            placeholderTextColor={Colors.muted}
            style={styles.input}
            multiline
            editable={isOnline && !sending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim() || !isOnline || sending}
            style={[styles.sendBtn, (!draft.trim() || !isOnline || sending) && styles.sendBtnDisabled]}
          >
            {sending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Icon name="send" size={20} color={Colors.white} strokeWidth={2} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  infoBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  pinned: { marginHorizontal: 16, marginBottom: 8, padding: 11, paddingHorizontal: 14, borderRadius: 14, backgroundColor: Colors.primaryTint, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pinnedText: { flex: 1, fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: Colors.primaryInk, fontWeight: '500', lineHeight: 19 },
  filterWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  msgContent: { padding: 16, paddingBottom: 12, gap: 10 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.danger, textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.white, fontWeight: '600' },
  emptyText: { fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.muted, textAlign: 'center' },
  skeletonList: { flex: 1, padding: 16, gap: 12 },
  skeletonAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border },
  skeletonBubble: { height: 44, width: '55%', borderRadius: 18, backgroundColor: Colors.border },
  skeletonBubbleMe: { alignSelf: 'flex-end' },
  sysRow: { alignItems: 'center' },
  sysBubble: { flexDirection: 'row', alignItems: 'center', gap: 7, maxWidth: '85%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13 },
  sysText: { fontFamily: Fonts.bodyMedium, fontSize: 11.5, color: Colors.mutedStrong, fontWeight: '500', lineHeight: 16, flexShrink: 1 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', justifyContent: 'flex-start' },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '72%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderBottomLeftRadius: 5, padding: 9, paddingHorizontal: 13, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  bubbleMe: { backgroundColor: Colors.primary, borderWidth: 0, borderRadius: 18, borderBottomRightRadius: 5, borderBottomLeftRadius: 18 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  senderName: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.muted, fontWeight: '600' },
  ketuaBadge: { backgroundColor: Colors.primaryTint, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  ketuaLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 9.5, color: Colors.primaryInk, fontWeight: '700' },
  msgText: { fontFamily: Fonts.bodyRegular, fontSize: 14, lineHeight: 20, color: Colors.ink },
  msgTextMe: { color: Colors.white },
  msgTime: { fontFamily: Fonts.bodyRegular, fontSize: 10, color: Colors.muted, marginTop: 3, textAlign: 'left' },
  msgTimeMe: { textAlign: 'right', color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexShrink: 0, padding: 10, paddingHorizontal: 16, paddingBottom: 26, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: Colors.bg },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input: { flex: 1, minHeight: 42, maxHeight: 100, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: 16, paddingVertical: 10, fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.ink, backgroundColor: Colors.bg },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 10, elevation: 6 },
  sendBtnDisabled: { opacity: 0.45 },
});
