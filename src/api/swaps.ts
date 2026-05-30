import { apiCall } from './client';

export interface Swap {
  id: string;
  group_id: string;
  requester_id: string;
  target_id: string;
  status: 'pending' | 'waiting_ketua' | 'target_accepted' | 'target_rejected' | 'approved' | 'ketua_rejected';
  created_at: string;
  requester?: { name: string | null; phone: string };
  target?: { name: string | null; phone: string };
  // GAP-024: tidak ada di DB, hanya tersedia saat request pertama dibuat (local state)
  requester_period?: number;
  target_period?: number;
}

export const swapsApi = {
  // GAP-022: backend membungkus dalam { swap } — unwrap di sini
  request: (targetId: string, groupId: string, token: string) =>
    apiCall<{ swap: Swap }>('/api/swaps', {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId, group_id: groupId }),
      token,
    }).then((r) => r.swap),

  // GAP-023: backend mengembalikan { status } bukan { message }
  respond: (swapId: string, response: 'accepted' | 'rejected', token: string) =>
    apiCall<{ status: string }>(`/api/swaps/${swapId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
      token,
    }),

  approve: (swapId: string, decision: 'approved' | 'ketua_rejected', token: string) =>
    apiCall<{ status: string }>(`/api/swaps/${swapId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
      token,
    }),

  getMySwaps: (token: string) =>
    apiCall<{ swaps: Swap[] }>('/api/swaps/my', { token }),

  getGroupSwaps: (groupId: string, token: string) =>
    apiCall<{ swaps: Swap[] }>(`/api/swaps/group/${groupId}`, { token }),
};
