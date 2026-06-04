import { apiCall } from './client';

// GAP-020: field names disesuaikan dengan yang tersedia dari backend
export interface Winner {
  id: string;
  user_id: string;
  period_number: number;   // dari periods.periode_ke
  winner_name: string;     // dari users.name
  arisan_amount: number;   // tidak ada di DB, selalu 0
  drawn_at: string;        // dari created_at
}

interface RawWinner {
  id: string;
  user_id: string;
  created_at: string;
  period_id: string;
  arisan_amount?: number;
  periods: { periode_ke: number } | null;
  users: { name: string | null; phone: string } | null;
}

function adaptWinner(raw: RawWinner): Winner {
  return {
    id: raw.id,
    user_id: raw.user_id,
    period_number: raw.periods?.periode_ke ?? 0,
    winner_name: raw.users?.name ?? raw.users?.phone ?? '',
    arisan_amount: raw.arisan_amount ?? 0,
    drawn_at: raw.created_at,
  };
}

export const undianApi = {
  start: (
    groupId: string,
    mode: 'fixed' | 'random' | 'manual',
    periodId: string,
    winnerId?: string,
    token?: string,
  ) =>
    apiCall<{ winner: { id: string; name: string }; periode_ke: number }>(
      `/api/groups/${groupId}/undian`,
      {
        method: 'POST',
        body: JSON.stringify({ mode, period_id: periodId, winner_id: winnerId }),
        token,
      },
    ),

  // GAP-019: endpoint GET /winners sekarang ada di backend
  getHistory: (groupId: string, token: string): Promise<{ winners: Winner[] }> =>
    apiCall<{ winners: RawWinner[] }>(`/api/groups/${groupId}/winners`, { token }).then((r) => ({
      winners: (r.winners ?? []).map(adaptWinner),
    })),
};
