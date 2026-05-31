# MO-3 — Tracking Pembayaran UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-2 + BE-3 selesai.
> Konfirmasi: Supabase Realtime aktif untuk tabel payments (dari BE-0)?
> Cek .claude/designs/ untuk mockup PaymentStatus dan PaymentHistory.
> Scope: src/screens/payments/ + src/hooks/usePaymentRealtime.ts + src/api/payments.ts.
> ```

---

## `src/api/payments.ts`

```typescript
export const paymentsApi = {
  getPeriodStatus: (groupId: string, periodId: string, token: string) =>
    apiCall<{ payments: Payment[] }>(`/api/payments/${groupId}/${periodId}`, { token }),

  confirm: (groupId: string, periodId: string, memberId: string, token: string) =>
    apiCall<{ message: string }>(`/api/payments/${groupId}/${periodId}/confirm`, {
      method: 'POST', body: JSON.stringify({ member_id: memberId }), token,
    }),

  cancelConfirm: (groupId: string, periodId: string, memberId: string, token: string) =>
    apiCall<{ message: string }>(`/api/payments/${groupId}/${periodId}/confirm`, {
      method: 'DELETE', body: JSON.stringify({ member_id: memberId }), token,
    }),
};
```

---

## `src/hooks/usePaymentRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export function usePaymentRealtime(periodId: string, initial: Payment[]) {
  const [payments, setPayments] = useState(initial);

  useEffect(() => {
    const channel = supabase
      .channel(`payments:${periodId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'payments',
        filter: `period_id=eq.${periodId}`,
      }, (payload) => {
        setPayments(prev => {
          const updated = payload.new as Payment;
          const idx = prev.findIndex(p => p.user_id === updated.user_id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [periodId]);

  return payments;
}
```

---

## `PaymentStatusScreen.tsx`

Tampilkan:
- Header "Status Bayar — Periode [N]"
- Jatuh tempo (merah jika sudah lewat)
- Progress bar: "[X]/[Y] anggota sudah bayar"
- Badge "Live" di header
- List anggota + status:
  - ✓ Lunas (hijau) + timestamp "Dikonfirmasi [nama] · [tgl jam]"
  - ⏰ Belum bayar (abu)
  - ⚠ Terlambat (merah)

Ketua: tap anggota → modal "Konfirmasi bayar [nama]?" / "Batalkan konfirmasi?"

Offline: OfflineBanner + label "Data terakhir diperbarui: [waktu]" + semua aksi disabled.

---

## `PaymentHistoryScreen.tsx`

Accordion per periode. Expand → list anggota + status. Sortir periode terbaru dulu.

---

## Checklist

```
[ ] Realtime: usePaymentRealtime pakai Supabase Realtime (bukan polling)?
[ ] Konfirmasi bayar: hanya ketua yang bisa (cek di UI, backend sudah cek)?
[ ] Cache: status bayar disimpan ke AsyncStorage setelah fetch?
[ ] Offline: banner + label waktu + aksi disabled?
[ ] OfflineBanner ada di PaymentStatusScreen?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): payment tracking + realtime + offline cache"
Update MO-3. Catat: apakah Realtime berhasil ditest dengan 2 device?
```

**Sesi berikutnya:** `MO-4-undian.md`

---
---

