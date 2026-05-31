import { useEffect, useRef, useState } from 'react';
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
  const initialRef = useRef(initial);

  // sync if initial changes (e.g. after fresh fetch)
  useEffect(() => {
    if (initial !== initialRef.current) {
      initialRef.current = initial;
      setPayments(initial);
    }
  }, [initial]);

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
              // GAP-018: preserve user field — realtime tidak menyertakan JOIN ke users
              next[idx] = { ...raw, user: prev[idx].user };
              return next;
            }
            return prev;
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
