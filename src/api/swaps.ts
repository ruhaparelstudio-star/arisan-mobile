import { apiCall } from './client';

export interface Swap {
  id: string;
  group_id: string;
  requester_id: string;
  target_id: string;
  requester_period: number;
  target_period: number;
  status: 'pending' | 'target_accepted' | 'target_rejected' | 'approved' | 'ketua_rejected';
  created_at: string;
  requester?: { name: string | null; phone: string };
  target?: { name: string | null; phone: string };
}

export const swapsApi = {
  request: (targetId: string, groupId: string, token: string) =>
    apiCall<Swap>('/api/swaps', {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId, group_id: groupId }),
      token,
    }),
  respond: (swapId: string, response: 'accepted' | 'rejected', token: string) =>
    apiCall<{ message: string }>(`/api/swaps/${swapId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
      token,
    }),
  approve: (swapId: string, decision: 'approved' | 'ketua_rejected', token: string) =>
    apiCall<{ message: string }>(`/api/swaps/${swapId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
      token,
    }),
  getMySwaps: (token: string) =>
    apiCall<{ swaps: Swap[] }>('/api/swaps/my', { token }),
  getGroupSwaps: (groupId: string, token: string) =>
    apiCall<{ swaps: Swap[] }>(`/api/swaps/group/${groupId}`, { token }),
};
