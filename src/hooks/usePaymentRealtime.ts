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
            const updated = payload.new as Payment;
            const idx = prev.findIndex((p) => p.user_id === updated.user_id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = updated;
              return next;
            }
            return [...prev, updated];
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
