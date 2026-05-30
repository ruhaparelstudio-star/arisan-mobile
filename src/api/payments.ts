import { apiCall } from './client';

export interface Payment {
  id: string;
  group_id: string;
  period_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'late';
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  user: { name: string | null; phone: string };
}

export interface Period {
  id: string;
  group_id: string;
  period_number: number;
  due_date: string;
  winner_user_id: string | null;
  status: 'open' | 'closed';
}

export function getPayments(token: string, groupId: string, periodId: string): Promise<Payment[]> {
  return apiCall(`/api/groups/${groupId}/periods/${periodId}/payments`, { token });
}

export function confirmPayment(
  token: string,
  groupId: string,
  periodId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/periods/${periodId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ member_id: userId }),
    token,
  });
}

export function cancelConfirm(
  token: string,
  groupId: string,
  periodId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/periods/${periodId}/confirm`, {
    method: 'DELETE',
    body: JSON.stringify({ member_id: userId }),
    token,
  });
}

export function getPeriods(token: string, groupId: string): Promise<Period[]> {
  return apiCall(`/api/groups/${groupId}/periods`, { token });
}
