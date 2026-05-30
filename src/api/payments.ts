import { apiCall } from './client';

// GAP-017: hapus group_id (tidak ada di DB)
export interface Payment {
  id: string;
  period_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'late';
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  user: { name: string | null; phone: string };
}

// GAP-016: field names disesuaikan dengan DB + status values
export interface Period {
  id: string;
  group_id: string;
  period_number: number;   // dari periode_ke
  due_date: string;        // dari jatuh_tempo
  status: 'upcoming' | 'active' | 'closed';  // backend: upcoming|active|completed → mobile: upcoming|active|closed
}

// GAP-013+GAP-015: fix URL prefix + unwrap { payments }
export function getPayments(token: string, groupId: string, periodId: string): Promise<Payment[]> {
  return apiCall<{ payments: Payment[] }>(`/api/payments/${groupId}/${periodId}`, { token }).then(
    (r) => r.payments,
  );
}

// GAP-014: fix URL prefix dari /api/groups/ ke /api/payments/
export function confirmPayment(
  token: string,
  groupId: string,
  periodId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiCall(`/api/payments/${groupId}/${periodId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ member_id: userId }),
    token,
  });
}

// GAP-014: fix URL prefix dari /api/groups/ ke /api/payments/
export function cancelConfirm(
  token: string,
  groupId: string,
  periodId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiCall(`/api/payments/${groupId}/${periodId}/confirm`, {
    method: 'DELETE',
    body: JSON.stringify({ member_id: userId }),
    token,
  });
}

// GAP-012+GAP-016: endpoint ada di backend; remap periode_ke→period_number, jatuh_tempo→due_date
export function getPeriods(token: string, groupId: string): Promise<Period[]> {
  return apiCall<{ periods: RawPeriod[] }>(`/api/groups/${groupId}/periods`, { token }).then((r) =>
    r.periods.map(adaptPeriod),
  );
}

interface RawPeriod {
  id: string;
  group_id: string;
  periode_ke: number;
  jatuh_tempo: string;
  status: 'upcoming' | 'active' | 'completed';
}

function adaptPeriod(raw: RawPeriod): Period {
  return {
    id: raw.id,
    group_id: raw.group_id,
    period_number: raw.periode_ke,
    due_date: raw.jatuh_tempo,
    status: raw.status === 'completed' ? 'closed' : raw.status,
  };
}
