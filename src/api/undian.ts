import { apiCall } from './client';

export interface Winner {
  id: string;
  user_id: string;
  period_number: number;
  winner_name: string;
  arisan_amount: number;
  drawn_at: string;
}

export const undianApi = {
  start: (groupId: string, mode: 'fixed' | 'random' | 'manual', periodId: string, winnerId?: string, token?: string) =>
    apiCall<{ winner: { id: string; name: string }; periode_ke: number }>(
      `/api/groups/${groupId}/undian`,
      { method: 'POST', body: JSON.stringify({ mode, period_id: periodId, winner_id: winnerId }), token }
    ),

  getHistory: (groupId: string, token: string) =>
    apiCall<{ winners: Winner[] }>(`/api/groups/${groupId}/winners`, { token }),
};
