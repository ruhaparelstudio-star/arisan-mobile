import { createClient } from '@supabase/supabase-js';
import { apiCall } from './client';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  type: 'user' | 'system';
}

export interface MessagesResponse {
  messages: ChatMessage[];
  has_more: boolean;
}

export interface ActivityLogEntry {
  id: string;
  icon: string;
  tone: 'mint' | 'blue' | 'neutral' | 'amber';
  text: string;
  created_at: string;
}

export interface ActivityLogResponse {
  entries: ActivityLogEntry[];
  has_more: boolean;
}

// Ambil pesan awal via Supabase JS (dengan JOIN ke users)
export async function fetchMessages(
  groupId: string,
  limit = 30,
  before?: string,
): Promise<MessagesResponse> {
  if (!supabase) return { messages: [], has_more: false };

  let query = supabase
    .from('messages')
    .select('id, group_id, user_id, content, created_at, user:users!user_id(name, phone)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (before) {
    const { data: pivot } = await supabase
      .from('messages')
      .select('created_at')
      .eq('id', before)
      .single();
    if (pivot) query = query.lt('created_at', (pivot as { created_at: string }).created_at);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    group_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user: { name: string | null; phone: string } | null;
  }>;

  const has_more = rows.length > limit;
  const messages: ChatMessage[] = (has_more ? rows.slice(0, limit) : rows).map((r) => ({
    id: r.id,
    group_id: r.group_id,
    user_id: r.user_id,
    content: r.content,
    created_at: r.created_at,
    user_name: r.user?.name ?? r.user?.phone ?? 'Anggota',
    type: 'user',
  }));

  return { messages, has_more };
}

// Subscribe ke pesan baru via Supabase Realtime
export function subscribeMessages(
  groupId: string,
  onNewMessage: (msg: Omit<ChatMessage, 'user_name'>) => void,
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`messages:${groupId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
      (payload) => {
        const raw = payload.new as {
          id: string;
          group_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        onNewMessage({ ...raw, type: 'user' });
      },
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}

// Kirim pesan via REST POST (backend validasi membership)
export function sendMessage(
  token: string,
  groupId: string,
  content: string,
): Promise<{ message: ChatMessage }> {
  return apiCall(`/api/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    token,
  });
}

export function getActivityLog(
  token: string,
  groupId: string,
  limit = 30,
  offset = 0,
): Promise<ActivityLogResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiCall(`/api/groups/${groupId}/activity-log?${params}`, { token });
}
