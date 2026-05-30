import { apiCall } from './client';

export interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  user_id?: string;
  user_name?: string;
  text: string;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  icon: string;
  tone: 'mint' | 'blue' | 'neutral' | 'amber';
  text: string;
  created_at: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  has_more: boolean;
}

export interface ActivityLogResponse {
  entries: ActivityLogEntry[];
  has_more: boolean;
}

export function getMessages(
  token: string,
  groupId: string,
  limit = 30,
  before?: string,
): Promise<MessagesResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  return apiCall(`/api/groups/${groupId}/messages?${params}`, { token });
}

export function sendMessage(
  token: string,
  groupId: string,
  text: string,
): Promise<{ message: ChatMessage }> {
  return apiCall(`/api/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
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
