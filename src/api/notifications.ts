import { apiCall } from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export function getNotifications(token: string): Promise<Notification[]> {
  return apiCall('/api/notifications', { token });
}

export function markAllRead(token: string): Promise<{ message: string }> {
  return apiCall('/api/notifications/read-all', {
    method: 'POST',
    token,
  });
}
