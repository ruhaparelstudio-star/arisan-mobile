import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AppBar } from '../../components/ui/AppBar';
import { Segmented } from '../../components/ui/Segmented';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';
import { StateView } from '../../components/ui/StateView';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAuth } from '../../hooks/useAuth';
import { fetchMessages, sendMessage, subscribeMessages, sendTyping, getTyping, ChatMessage } from '../../api/chat';
import { useChatSound } from '../../hooks/useChatSound';

type DateDivider = { type: 'date'; id: string; label: string };
type ListItem = ChatMessage | DateDivider;

function formatDateLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Untuk inverted FlatList (data: newest→oldest), divider disisipkan setelah
// pesan terakhir tiap hari — sehingga secara visual muncul di atas grup tersebut.
function insertDateDividers(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  for (let i = 0; i < messages.length; i++) {
    items.push(messages[i]);
    const currDate = new Date(messages[i].created_at).toDateString();
    const nextDate = i + 1 < messages.length ? new Date(messages[i + 1].created_at).toDateString() : null;
    if (currDate !== nextDate) {
      items.push({ type: 'date', id: `divider-${currDate}`, label: formatDateLabel(new Date(messages[i].created_at)) });
    }
  }
  return items;
}

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' });
}

function buildPinnedText(
  periodNumber?: number,
  winnerName?: string | null,
  paidCount?: number,
  memberCount?: number,
  dueDate?: string | null,
): string {
  if (!periodNumber) return 'Periode aktif · Tap untuk detail';
  const parts: string[] = [`Periode ${periodNumber}`];
  if (winnerName) parts[0] += `: ${winnerName} menang`;
  if (paidCount !== undefined && memberCount) parts.push(`${paidCount}/${memberCount} lunas`);
  if (dueDate) {
    const days = Math.max(0, Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000));
    parts.push(days === 0 ? 'Hari ini' : `H-${days}`);
  }
  return parts.join(' · ');
}

function SkeletonBubble({ me }: { me?: boolean }) {
  return (
    <View style={me ? styles.msgWrapperMe : styles.msgWrapper}>
      {!me && <View style={styles.skeletonAvatar} />}
      <View style={[styles.skeletonBubble, me && styles.skeletonBubbleMe]} />
    </View>
  );
}

export function ChatScreen({ navigation, route }: Props) {
  const { groupId, groupName, memberCount, ketuaId, periodNumber, winnerName, paidCount, dueDate } = route.params;
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
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);

  // userNameCache: user_id → name (diisi dari initial load, dipakai untuk realtime events)
  const userNameCache = useRef<Record<string, string>>({});
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playNotification } = useChatSound();

  const flatRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMessages(groupId, 30);
      setMessages(res.messages);
      setHasMore(res.has_more);
      // Populate name cache dari initial load
      for (const m of res.messages) {
        if (m.user_id && m.user_name) userNameCache.current[m.user_id] = m.user_name;
      }
      setError(null);
    } catch {
      setError('Gagal memuat pesan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[messages.length - 1].id;
      const res = await fetchMessages(groupId, 30, oldest);
      // Populate cache dari older messages
      for (const m of res.messages) {
        if (m.user_id && m.user_name) userNameCache.current[m.user_id] = m.user_name;
      }
      setMessages((prev) => [...prev, ...res.messages]);
      setHasMore(res.has_more);
    } catch {
      // silently fail for pagination
    } finally {
      setLoadingMore(false);
    }
  }, [groupId, hasMore, loadingMore, messages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Poll typing indicator tiap 3 detik saat online
  useEffect(() => {
    if (!isOnline || !token) return;
    const poll = setInterval(async () => {
      try {
        const res = await getTyping(token, groupId);
        setTypingUsers(res.typing);
      } catch {
        // silently fail — typing indicator tidak kritikal
      }
    }, 8000);
    return () => clearInterval(poll);
  }, [groupId, token, isOnline]);

  // Supabase Realtime subscription — gantikan polling
  useEffect(() => {
    const unsubscribe = subscribeMessages(groupId, (rawMsg) => {
      const fullMsg: ChatMessage = {
        ...rawMsg,
        user_name: userNameCache.current[rawMsg.user_id] ?? 'Anggota',
      };
      setMessages((prev) => {
        // Dedupe: jika message ID sudah ada (dari optimistic update), skip
        if (prev.some((m) => m.id === fullMsg.id)) return prev;
        // Play sound hanya untuk pesan dari orang lain
        if (rawMsg.user_id !== user?.id) playNotification();
        return [fullMsg, ...prev];
      });
    });
    return unsubscribe;
  }, [groupId, user?.id, playNotification]);

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (!isOnline || !token || !text.trim()) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      sendTyping(token, groupId).catch(() => {});
    }, 500);
  };

  const handleSend = async () => {
    if (!draft.trim() || !isOnline || !token || sending) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    const content = draft.trim();
    setDraft('');
    setSending(true);
    try {
      const res = await sendMessage(token, groupId, content);
      // Tambah ke state secara optimistis; realtime akan dedupe jika datang dobel
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [{ ...res.message, user_name: user?.name ?? user?.phone ?? 'Saya' }, ...prev];
      });
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const filtered = useMemo<ListItem[]>(() => insertDateDividers(
    messages.filter((m) => {
      if (filter === 'Semua') return true;
      if (filter === 'Sistem') return m.type === 'system';
      return m.type === 'user';
    }),
  ), [messages, filter]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if ('type' in item && item.type === 'date') {
      return (
        <View style={styles.dateDivider}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }
    if (item.type === 'system') {
      return (
        <View style={styles.sysRow}>
          <View style={styles.sysBubble}>
            <Icon name="sparkles" size={14} color={Colors.primaryInk} />
            <Text style={styles.sysText}>{item.content}</Text>
          </View>
        </View>
      );
    }
    const isMe = item.user_id === user?.id;
    const isKetua = item.user_id === ketuaId;
    const displayName = item.user_name ?? 'Anggota';

    if (isMe) {
      return (
        <View style={styles.msgWrapperMe}>
          <View style={styles.bubbleMe}>
            <Text style={styles.msgTextMe}>{item.content}</Text>
          </View>
          <Text style={styles.msgTimeMe}>{formatTime(item.created_at)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.msgWrapper}>
        <View style={styles.avatarContentRow}>
          <Avatar name={displayName} size={28} />
          <View>
            <View style={styles.senderRow}>
              <Text style={styles.senderName}>{displayName}</Text>
              {isKetua && (
                <View style={styles.ketuaBadge}>
                  <Text style={styles.ketuaLabel}>Ketua</Text>
                </View>
              )}
            </View>
            <View style={styles.bubble}>
              <Text style={styles.msgText}>{item.content}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.msgTime}>{formatTime(item.created_at)}</Text>
      </View>
    );
  }, [user?.id, ketuaId, filter]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
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
        <Text style={styles.pinnedText} numberOfLines={1}>
          {buildPinnedText(periodNumber, winnerName, paidCount, memberCount, dueDate)}
        </Text>
        <Icon name="chevronRight" size={17} color={Colors.primaryInk} />
      </TouchableOpacity>

      <View style={styles.filterWrap}>
        <Segmented options={['Semua', 'Obrolan', 'Sistem']} value={filter} onChange={setFilter} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
        ) : filtered.length === 0 ? (
          <StateView
            icon="message"
            tone="mint"
            title="Belum ada obrolan"
            body="Jadi yang pertama menyapa! Event sistem seperti undian & konfirmasi bayar juga akan tampil di sini."
          />
        ) : (
          <FlatList<ListItem>
            ref={flatRef}
            data={filtered}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.msgContent}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} /> : null}
          />
        )}

        {typingUsers.length > 0 && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>
              {typingUsers.map((u) => u.name).join(', ')} sedang mengetik...
            </Text>
          </View>
        )}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Icon name="plus" size={22} color={Colors.primaryInk} strokeWidth={2} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={handleDraftChange}
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
  msgContentEmpty: { flexGrow: 1 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dateLabel: { fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted },
  skeletonList: { flex: 1, padding: 16, gap: 12 },
  skeletonAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border },
  skeletonBubble: { height: 44, width: '55%', borderRadius: 18, backgroundColor: Colors.border },
  skeletonBubbleMe: { alignSelf: 'flex-end' },
  sysRow: { alignItems: 'center' },
  sysBubble: { flexDirection: 'row', alignItems: 'center', gap: 7, maxWidth: '85%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13 },
  sysText: { fontFamily: Fonts.bodyMedium, fontSize: 11.5, color: Colors.mutedStrong, fontWeight: '500', lineHeight: 16, flexShrink: 1 },
  // other user message layout
  msgWrapper: { alignSelf: 'flex-start', maxWidth: '78%' },
  avatarContentRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  senderName: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.muted, fontWeight: '600' },
  bubble: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderBottomLeftRadius: 5, padding: 9, paddingHorizontal: 13, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  msgText: { fontFamily: Fonts.bodyRegular, fontSize: 14, lineHeight: 20, color: Colors.ink },
  msgTime: { fontFamily: Fonts.bodyRegular, fontSize: 10, color: Colors.muted, marginTop: 3, marginLeft: 36 },
  // own message layout
  msgWrapperMe: { alignSelf: 'flex-end', maxWidth: '78%' },
  bubbleMe: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 5, padding: 9, paddingHorizontal: 13 },
  msgTextMe: { fontFamily: Fonts.bodyRegular, fontSize: 14, lineHeight: 20, color: Colors.white },
  msgTimeMe: { fontFamily: Fonts.bodyRegular, fontSize: 10, color: Colors.muted, marginTop: 3, textAlign: 'right' },
  ketuaBadge: { backgroundColor: Colors.primaryTint, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  ketuaLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 9.5, color: Colors.primaryInk, fontWeight: '700' },
  typingBar: { paddingHorizontal: 16, paddingVertical: 4, backgroundColor: Colors.bg },
  typingText: { fontFamily: Fonts.bodyRegular, fontSize: 12, color: Colors.muted, fontStyle: 'italic' },
  inputBar: { flexShrink: 0, padding: 10, paddingHorizontal: 16, paddingBottom: 26, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: Colors.bg },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input: { flex: 1, minHeight: 42, maxHeight: 100, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: 16, paddingVertical: 10, fontFamily: Fonts.bodyRegular, fontSize: 14, color: Colors.ink, backgroundColor: Colors.bg },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: Colors.primaryShadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 10, elevation: 6 },
  sendBtnDisabled: { opacity: 0.45 },
});
