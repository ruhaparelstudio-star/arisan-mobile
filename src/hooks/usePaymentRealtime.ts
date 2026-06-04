import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Payment } from '../api/payments';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export function usePaymentRealtime(periodId: string, initial: Payment[]): Payment[] {
  const [payments, setPayments] = useState<Payment[]>(initial);

  // Sync when actual payment data changes — use a stable content key to avoid
  // firing on every re-render where the parent passes a new array reference.
  const initialKey = initial.map((p) => `${p.user_id}:${p.status}:${p.id ?? ''}`).join(',');
  useEffect(() => {
    setPayments(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  useEffect(() => {
    if (!supabase || !periodId) return;

    const channel = supabase
      .channel(`payments:${periodId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `period_id=eq.${periodId}` },
        (payload) => {
          setPayments((prev) => {
            // DELETE: payload.new adalah {} — gunakan payload.old
            if (payload.eventType === 'DELETE') {
              const old = payload.old as { user_id?: string };
              return prev.filter((p) => p.user_id !== old.user_id);
            }
            const raw = payload.new as Omit<Payment, 'user'>;
            const idx = prev.findIndex((p) => p.user_id === raw.user_id);
            if (idx >= 0) {
              const next = [...prev];
              // preserve user field — realtime tidak menyertakan JOIN ke users
              next[idx] = { ...raw, user: prev[idx].user };
              return next;
            }
            // INSERT untuk user baru — tambah dengan placeholder user (nama muncul setelah refresh)
            return [...prev, { ...raw, user: { name: null, phone: raw.user_id } }];
          });
        },
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [periodId]);

  return payments;
}
