import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
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

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;

type Message = {
  id: string;
  sys?: boolean;
  sysIcon?: string;
  who?: string;
  me?: boolean;
  text: string;
  when: string;
};

const INITIAL_MSGS: Message[] = [
  { id: '1', sys: true, sysIcon: 'sparkles', text: 'Undian periode 4 selesai — Andi Pratama menang 🎉', when: '20:00' },
  { id: '2', who: 'Budi', text: 'Selamat Andiii! 🎉', when: '20:01' },
  { id: '3', who: 'Maya', text: 'wah congrats! traktir dong wkwk 😄', when: '20:02' },
  { id: '4', sys: true, sysIcon: 'checkCircle', text: 'Ketua konfirmasi bayar anggota', when: '20:05' },
  { id: '5', me: true, text: 'Yang belum transfer ditunggu sampai besok ya 🙏', when: '20:06' },
  { id: '6', who: 'Andi', text: 'siap kak, nanti malam transfer', when: '20:07' },
];

export function ChatScreen({ navigation, route }: Props) {
  const { groupId, groupName, memberCount } = route.params;
  const { user } = useAuth();
  const isOnline = useNetworkStatus();
  const [filter, setFilter] = useState('Semua');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [draft, setDraft] = useState('');

  const filtered = messages.filter((m) => {
    if (filter === 'Semua') return true;
    if (filter === 'Sistem') return m.sys;
    return !m.sys;
  });

  const handleSend = () => {
    if (!draft.trim() || !isOnline) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), me: true, text: draft.trim(), when: new Date().toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setDraft('');
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

      {/* Pinned status */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.pinned}
      >
        <Icon name="trophy" size={18} color={Colors.primaryInk} />
        <Text style={styles.pinnedText} numberOfLines={1}>
          Periode aktif · Tap untuk detail
        </Text>
        <Icon name="chevronRight" size={17} color={Colors.primaryInk} />
      </TouchableOpacity>

      <View style={styles.filterWrap}>
        <Segmented options={['Semua', 'Obrolan', 'Sistem']} value={filter} onChange={setFilter} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.msgList}
          contentContainerStyle={styles.msgContent}
        >
          <Text style={styles.dateDivider}>Hari ini</Text>
          {filtered.map((m) => {
            if (m.sys) {
              return (
                <View key={m.id} style={styles.sysRow}>
                  <View style={styles.sysBubble}>
                    <Icon name={m.sysIcon ?? 'info'} size={14} color={Colors.primaryInk} />
                    <Text style={styles.sysText}>{m.text}</Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={m.id} style={[styles.msgRow, m.me && styles.msgRowMe]}>
                {!m.me && <Avatar name={m.who ?? '?'} size={28} />}
                <View style={[styles.bubble, m.me && styles.bubbleMe]}>
                  {!m.me && <Text style={styles.senderName}>{m.who}</Text>}
                  <Text style={[styles.msgText, m.me && styles.msgTextMe]}>{m.text}</Text>
                  <Text style={[styles.msgTime, m.me && styles.msgTimeMe]}>{m.when}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

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
            editable={isOnline}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!draft.trim() || !isOnline}
            style={[styles.sendBtn, (!draft.trim() || !isOnline) && styles.sendBtnDisabled]}
          >
            <Icon name="send" size={20} color={Colors.white} strokeWidth={2} />
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
  msgList: { flex: 1 },
  msgContent: { padding: 16, paddingBottom: 12, gap: 10 },
  dateDivider: { textAlign: 'center', fontFamily: Fonts.bodyRegular, fontSize: 11.5, color: Colors.muted, marginBottom: 2 },
  sysRow: { alignItems: 'center' },
  sysBubble: { flexDirection: 'row', alignItems: 'center', gap: 7, maxWidth: '85%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 13 },
  sysText: { fontFamily: Fonts.bodyMedium, fontSize: 11.5, color: Colors.mutedStrong, fontWeight: '500', lineHeight: 16, flexShrink: 1 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', justifyContent: 'flex-start' },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '72%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, borderBottomLeftRadius: 5, padding: 9, paddingHorizontal: 13, shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  bubbleMe: { backgroundColor: Colors.primary, borderWidth: 0, borderRadius: 18, borderBottomRightRadius: 5, borderBottomLeftRadius: 18 },
  senderName: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.muted, marginBottom: 3, fontWeight: '600' },
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
