# MO-11 — Code Review Findings & Fix Plan

> Sesi: MO-11 | Tanggal: 2026-05-31
> Reviewer: Claude Code (automated multi-angle review)
> Branch target: `feature/mo-11-bug-fixes`

---

## Ringkasan

10 temuan dari code review otomatis (7 angle × 6 kandidat → verify fase).
Diurutkan berdasarkan severity. Semua harus di-fix sebelum merge ke `main`.

---

## Findings

### [F-01] KRITIS — UndianScreen: draw_mode diabaikan, selalu random

- **File:** [src/screens/undian/UndianScreen.tsx](src/screens/undian/UndianScreen.tsx) baris 66
- **Status:** CONFIRMED
- **Masalah:** `undianApi.start()` selalu dipanggil dengan `mode: 'random'`, padahal grup bisa dikonfigurasi dengan `draw_mode='fixed'` atau `'manual'`.
- **Dampak:** Grup dengan giliran tetap (fixed/manual) akan menerima draw acak — pemenang yang salah dipilih setiap kali undian dijalankan.
- **Fix:**
  ```ts
  // Sebelum
  await undianApi.start(groupId, 'random', token);

  // Sesudah — baca draw_mode dari group state
  await undianApi.start(groupId, group?.draw_mode ?? 'random', token);
  ```

---

### [F-02] KRITIS — DetailGrupScreen: myPeriod hardcoded 1 saat navigate ke RequestSwap

- **File:** [src/screens/groups/DetailGrupScreen.tsx](src/screens/groups/DetailGrupScreen.tsx) baris ~350
- **Status:** CONFIRMED
- **Masalah:** `navigation.navigate('RequestSwap', { groupId, myPeriod: 1 })` — `myPeriod` selalu 1, tidak membaca `slot_order` user yang sedang login.
- **Dampak:** Setiap request swap menampilkan periode yang salah di SwapApprovalScreen; ketua menyetujui swap dengan data periode yang keliru.
- **Fix:**
  ```ts
  // Cari slot_order milik current user dari member list
  const mySlot = group?.members?.find(m => m.user_id === user?.id)?.slot_order ?? 1;
  navigation.navigate('RequestSwap', { groupId, myPeriod: mySlot });
  ```

---

### [F-03] KRITIS — usePaymentRealtime: DELETE event tidak ditangani

- **File:** [src/hooks/usePaymentRealtime.ts](src/hooks/usePaymentRealtime.ts) baris ~36
- **Status:** CONFIRMED
- **Masalah:** Handler realtime menggunakan `payload.new` untuk semua event type. Untuk event `DELETE`, `payload.new` adalah `{}` sehingga `raw.user_id` adalah `undefined`, `findIndex` selalu -1, payment yang dibatalkan tidak dihapus dari state.
- **Dampak:** Setelah ketua `cancelConfirm`, anggota masih tampil sebagai "Lunas" sampai user refresh manual.
- **Fix:**
  ```ts
  // Tangani DELETE dengan payload.old
  if (payload.eventType === 'DELETE') {
    const oldRaw = payload.old as { user_id?: string };
    setPayments(prev => prev.filter(p => p.user_id !== oldRaw.user_id));
    return;
  }
  // UPDATE/INSERT pakai payload.new seperti sekarang
  ```

---

### [F-04] KRITIS — DetailGrupScreen: periodId kosong saat group belum active

- **File:** [src/screens/groups/DetailGrupScreen.tsx](src/screens/groups/DetailGrupScreen.tsx) baris ~348
- **Status:** CONFIRMED
- **Masalah:** Quick action "Bayar" menggunakan `group?.current_period_id ?? ''` — ketika grup masih dalam status `recruiting` (belum ada periode aktif), `periodId` dikirim sebagai string kosong ke PaymentStatusScreen.
- **Dampak:** PaymentStatusScreen memanggil `getPayments` dengan ID kosong → 404 atau data salah, tanpa pesan error yang jelas.
- **Fix:**
  ```ts
  // Disable tombol Bayar jika belum ada period aktif
  disabled={!group?.current_period_id || !isOnline}
  onPress={() => group?.current_period_id && navigation.navigate('Bayar', {
    groupId,
    periodId: group.current_period_id,
    // ...
  })}
  ```

---

### [F-05] TINGGI — groups.ts: crash null-dereference jika user dihapus (JOIN null)

- **File:** [src/api/groups.ts](src/api/groups.ts) baris ~67
- **Status:** PLAUSIBLE
- **Masalah:** `adaptMember` mengakses `(raw.users as { id: string }).id` sebagai fallback. Jika Supabase LEFT JOIN ke tabel `users` menghasilkan `null` (user dihapus), baris ini akan throw `TypeError: Cannot read property 'id' of null`.
- **Dampak:** Satu member yang akunnya dihapus akan menyebabkan seluruh `getGroupDetail` gagal — semua anggota lain tidak bisa melihat detail grup.
- **Fix:**
  ```ts
  // Tambah null guard
  user_id: raw.user_id ?? (raw.users as any)?.id ?? '',
  user: raw.users ?? { id: '', name: 'Pengguna Dihapus', phone: '' },
  ```

---

### [F-06] SEDANG — RequestSwapScreen: anggota tanpa slot_order tidak bisa dipilih

- **File:** [src/screens/swaps/RequestSwapScreen.tsx](src/screens/swaps/RequestSwapScreen.tsx) baris ~57
- **Status:** CONFIRMED
- **Masalah:** `.filter((m) => m.slot_order !== null)` menyembunyikan anggota yang belum mendapat slot dari SetGiliran. Anggota ini tidak bisa menjadi target swap sama sekali.
- **Dampak:** Jika SetGiliran belum selesai untuk semua anggota, beberapa anggota tidak bisa di-swap — user tidak tahu mengapa mereka tidak muncul.
- **Fix:**
  ```ts
  // Tampilkan semua anggota, tandai yang tanpa slot sebagai disabled
  const others = members.filter(m => m.user_id !== myId);
  // Di render item, disable jika slot_order null dengan tooltip
  disabled={m.slot_order === null}
  // Label: "Belum ada giliran"
  ```

---

### [F-07] SEDANG — DetailGrupScreen: winner tidak tampil jika current_period null

- **File:** [src/screens/groups/DetailGrupScreen.tsx](src/screens/groups/DetailGrupScreen.tsx) baris ~101
- **Status:** CONFIRMED
- **Masalah:** `winners.find(w => w.period_number === data.current_period)` — ketika `data.current_period` adalah `null`, perbandingan selalu false sehingga `currentWinnerName` tetap null meski pemenang ada.
- **Dampak:** Status card tidak menampilkan nama pemenang.
- **Fix:**
  ```ts
  const currentWinnerName = data.current_period != null
    ? winners.find(w => w.period_number === data.current_period)?.winner_name ?? null
    : null;
  ```

---

### [F-08] SEDANG — SwapInboxScreen: race condition saat cold start, inbox kosong palsu

- **File:** [src/screens/swaps/SwapInboxScreen.tsx](src/screens/swaps/SwapInboxScreen.tsx) baris ~30
- **Status:** PLAUSIBLE
- **Masalah:** `load()` dapat berjalan sebelum `user` context terisi (user masih null). Filter `s.target_id === user?.id` menghasilkan semua false → `setSwaps([])` → tampilan "Tidak Ada Request Masuk" padahal ada swap pending.
- **Dampak:** User yang baru buka app mungkin melihat inbox kosong sebentar, atau bahkan terus kosong jika load tidak di-retry saat user terisi.
- **Fix:**
  ```ts
  // Guard di awal load()
  if (!token || !user?.id) return;
  // Tambah user?.id ke dependency array useCallback
  }, [token, user?.id]);
  ```

---

### [F-09] SEDANG — UndianResultScreen: ketuaId kosong saat navigate ke Chat

- **File:** [src/screens/undian/UndianResultScreen.tsx](src/screens/undian/UndianResultScreen.tsx) baris ~126
- **Status:** CONFIRMED
- **Masalah:** `navigate('Chat', { ..., ketuaId: '' })` — string kosong hardcoded karena UndianResultScreen tidak memiliki akses ke `group.created_by`. Badge "Ketua" di ChatScreen tidak pernah tampil.
- **Dampak:** Fitur badge Ketua di chat tidak berfungsi setelah flow undian.
- **Fix:**
  ```ts
  // Teruskan ketuaId dari route params yang sudah diterima dari DetailGrupScreen
  // Tambah ketuaId ke navigation/types.ts UndianResult route params
  navigation.navigate('Chat', { groupId, groupName, memberCount, ketuaId: route.params.ketuaId ?? '' });
  ```

---

### [F-10] RENDAH — chat.ts: paginasi butuh 2 query Supabase per load-more

- **File:** [src/api/chat.ts](src/api/chat.ts) baris ~55
- **Status:** CONFIRMED
- **Masalah:** Saat `before` cursor diberikan, `fetchMessages` terlebih dahulu fetch `created_at` dari pivot row, lalu baru query pesan sebelum timestamp itu — 2 round trip sequential.
- **Dampak:** Setiap "load more" butuh 2x latency jaringan. Di koneksi mobile 100ms RTT, ini menambah 100ms per halaman.
- **Fix:**
  ```ts
  // Gunakan id sebagai cursor langsung jika kolom id adalah UUID v7 / ULID (ordered)
  // atau gunakan keyset: .lt('id', before) jika id auto-increment
  // Alternatif: kirim created_at dari client saat memanggil loadMore
  ```
  > Catatan: Fix ini membutuhkan verifikasi tipe kolom `id` di DB. Prioritas rendah.

---

## Urutan Implementasi

```
Fase 1 — Kritis (F-01 s/d F-04):
  [ ] F-03: usePaymentRealtime DELETE handler
  [ ] F-04: DetailGrupScreen Bayar guard + periodId kosong
  [ ] F-02: DetailGrupScreen myPeriod → slot_order aktual
  [ ] F-01: UndianScreen draw_mode aktual

Fase 2 — Tinggi/Sedang (F-05 s/d F-09):
  [ ] F-05: groups.ts null guard raw.users
  [ ] F-07: DetailGrupScreen winner null current_period
  [ ] F-08: SwapInboxScreen cold start guard
  [ ] F-06: RequestSwapScreen tampilkan anggota null slot_order sebagai disabled
  [ ] F-09: UndianResultScreen teruskan ketuaId

Fase 3 — Rendah (F-10):
  [ ] F-10: chat.ts paginasi single query (perlu verifikasi schema DB)
```

---

## Files yang Perlu Diubah

| File | Findings |
|------|----------|
| `src/hooks/usePaymentRealtime.ts` | F-03 |
| `src/screens/groups/DetailGrupScreen.tsx` | F-02, F-04, F-07 |
| `src/screens/undian/UndianScreen.tsx` | F-01 |
| `src/api/groups.ts` | F-05 |
| `src/screens/swaps/RequestSwapScreen.tsx` | F-06 |
| `src/screens/swaps/SwapInboxScreen.tsx` | F-08 |
| `src/screens/undian/UndianResultScreen.tsx` | F-09 |
| `src/api/chat.ts` | F-10 (optional) |
