import { apiCall } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  has_more: boolean;
}

export function getNotifications(
  token: string,
  limit = 20,
  before?: string,
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  return apiCall(`/api/notifications?${params}`, { token });
}

export function markRead(token: string, id: string): Promise<{ message: string }> {
  return apiCall(`/api/notifications/${id}/read`, { method: 'PATCH', token });
}

export function markAllRead(token: string): Promise<{ message: string }> {
  return apiCall('/api/notifications/read-all', { method: 'PATCH', token });
}
