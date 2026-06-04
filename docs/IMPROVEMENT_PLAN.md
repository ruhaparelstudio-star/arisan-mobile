# IMPROVEMENT PLAN — Arisan App
**Tanggal:** 2026-06-03  
**Berdasarkan:** SYSTEM_REVIEW.md  

---

## P0 — Harus diperbaiki sekarang (sistem tidak fungsional tanpa ini)

### P0-1: Tambah `undian_random` ke Supabase migration

**Estimasi:** 15 menit  
**File:** Buat `arisan-api/supabase/migrations/005_undian_random_fn.sql`

```sql
CREATE OR REPLACE FUNCTION undian_random(p_group_id UUID) RETURNS UUID AS $$
  SELECT gm.user_id FROM group_members gm
  WHERE gm.group_id = p_group_id
  AND gm.user_id NOT IN (
    SELECT w.user_id FROM winners w WHERE w.group_id = p_group_id
  )
  ORDER BY RANDOM() LIMIT 1;
$$ LANGUAGE SQL;
```

Jalankan di Supabase SQL Editor juga untuk environment yang sudah live.

---

### P0-2: Perbaiki Mode 3 — pisahkan `setSlotOrder` dari `isGroupEditable`

**Estimasi:** 30 menit  
**File:** `arisan-api/src/routes/groups.ts` (PUT `/:id/urutan`)

Ubah guard dari `isGroupEditable` ke check yang lebih spesifik: ketua boleh set urutan selama grup belum selesai semua periodenya (status != 'disbanded'). Hapus blok `isGroupEditable` dari endpoint urutan, ganti dengan:

```typescript
// Ganti ini:
if (!(await gs.isGroupEditable(groupId)))
  return c.json({ error: 'Urutan tidak bisa diubah setelah arisan berjalan' }, 400);

// Dengan ini:
const { data: group } = await supabase.from('groups').select('ketua_id, status').eq('id', groupId).single();
if (!group || group.ketua_id !== userId)
  return c.json({ error: 'Hanya ketua yang bisa mengatur giliran' }, 403);
if (group.status === 'disbanded')
  return c.json({ error: 'Grup sudah dibubarkan' }, 400);
```

---

### P0-3: Implementasi period advancement — close period + buka periode berikutnya

**Estimasi:** 2-3 jam  
**File:** `arisan-api/src/routes/groups.ts` (tambah endpoint baru)

Ini adalah missing flow yang paling penting. Tambah endpoint:

```
POST /api/groups/:id/periods/:periodId/close
```

Logic:
1. Validasi: hanya ketua, periode harus active
2. Cek semua anggota sudah bayar (optional: bisa force close dengan warning)
3. Update `periods` SET status = 'closed' WHERE id = periodId
4. Jika periode_ke < jumlah_periode: INSERT periode baru dengan status = 'active', periode_ke = periode_ke + 1
5. Jika periode_ke === jumlah_periode: UPDATE groups SET status = 'completed'
6. Log activity 'period_closed'
7. Notifikasi ke semua anggota

Di mobile, tambah tombol "Tutup Periode & Mulai Berikutnya" di DetailGrupScreen — tampil hanya untuk ketua setelah undian periode saat ini selesai.

---

### P0-4: Mode 3 — record winner per periode setelah urutan disimpan

**Estimasi:** 1 jam  
**File:** `arisan-api/src/routes/groups.ts` (PUT `/:id/urutan`), atau tambah endpoint baru

Setelah urutan disimpan untuk mode 3, backend perlu tahu pemenang periode N = anggota dengan `urutan = N`. Opsi terbaik:

**Pendekatan A** — lazy resolution: saat UndianScreen mode 3 dibuka untuk periode N, jika order sudah tersimpan, langsung resolve dan insert winner untuk periode N tanpa user action.

**Pendekatan B** — explicit: di UndianScreen mode 3 setelah order saved, tampilkan "Konfirmasi pemenang periode N" (menampilkan siapa dengan urutan N) dan ketua klik konfirmasi → `POST /api/groups/:id/undian` dengan mode manual dan winner_id yang tepat.

Pendekatan B lebih eksplisit dan konsisten dengan flow mode 1/2.

---

### P0-5: Buat tabel `push_tokens` di migration

**Estimasi:** 15 menit  
**File:** Buat `arisan-api/supabase/migrations/006_push_tokens.sql`

```sql
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

Pastikan mobile sudah POST token ke endpoint yang benar setelah login.

---

## P1 — Perbaiki dalam sprint berikutnya

### P1-1: Perbaiki invite code expiry check

**File:** `arisan-api/src/routes/groups.ts` (POST `/join`)

Tambah validasi:
```typescript
if (group.invite_code_expires_at && new Date(group.invite_code_expires_at) < new Date())
  return c.json({ error: 'Kode invite sudah kedaluwarsa. Minta kode baru dari ketua.' }, 400);
```

---

### P1-2: Hilangkan Stream.io dependency atau consolidate

Pilih satu: gunakan Stream.io sepenuhnya (migrate chat mobile ke Stream SDK) atau hapus Stream.io dan gunakan Supabase Realtime saja. Saat ini bayar 2 service untuk fungsi yang tumpang tindih.

Rekomendasi untuk tim 1 orang: **hapus Stream.io**, gunakan Supabase Realtime saja. Lebih sederhana, lebih murah.

---

### P1-3: Aktifkan Crashlytics atau pasang Sentry

Upload `google-services.json` asli dari Firebase Console, atau switch ke Sentry (`@sentry/react-native`) yang lebih mudah setup untuk Expo. Tanpa crash reporting, bug di produksi invisible.

---

### P1-4: Keputusan untuk `autoConfirmNetting`

Putuskan: aktifkan atau hapus. Jika fitur netting diinginkan, panggil `autoConfirmNetting` di route undian setelah `saveWinner`. Jika tidak, hapus fungsinya agar tidak jadi dead code yang membingungkan.

---

### P1-5: Tambah guard `FONNTE_TOKEN` di startup

**File:** `arisan-api/src/index.ts`

```typescript
if (!process.env.FONNTE_TOKEN) {
  logger.warn('FONNTE_TOKEN not set — WA notifications disabled');
}
```

Hindari silent failure. Log warning eksplisit saat startup.

---

## P2 — Peningkatan kualitas jangka menengah

### P2-1: Tambah minimal integration tests untuk undian flow

**Prioritas test yang harus ada:**
- `undianFixed` dengan urutan yang ada dan tidak ada
- `undianRandom` dengan anggota tersisa dan tanpa tersisa
- Double undian ditolak (period yang sudah punya winner)
- `createSwapRequest` batas 2x per user

Gunakan Vitest + Supabase local (`supabase start`).

### P2-2: Consolidate period advancement ke cron job

Pertimbangkan cron job harian yang:
1. Cek semua periode `active` yang jatuh temponya sudah lewat
2. Tandai payments yang belum bayar sebagai `late`
3. (Opsional) Notifikasi ke ketua untuk close period manual

Ini lebih aman daripada auto-close yang bisa salah timing.

### P2-3: Tambah endpoint `GET /api/groups/:id/summary`

Untuk HomeScreen hero card yang lebih akurat: berapa yang belum bayar, kapan jatuh tempo, siapa pemenang terakhir — dalam satu endpoint daripada 4 parallel call seperti sekarang.

### P2-4: RLS audit Supabase

Tabel `messages` tidak punya RLS (sengaja untuk MVP). Sebelum scale, semua tabel perlu RLS policy yang proper karena anon key exposed ke mobile client.

---

## Ringkasan Prioritas

```
SEKARANG (P0):
□ P0-1: Migration undian_random fn (15 min)
□ P0-2: Fix Mode 3 isGroupEditable (30 min)
□ P0-3: Period advancement endpoint (2-3 jam)
□ P0-4: Mode 3 winner recording (1 jam)
□ P0-5: push_tokens migration (15 min)

SPRINT BERIKUTNYA (P1):
□ P1-1: Invite code expiry check
□ P1-2: Consolidate Stream.io vs Supabase chat
□ P1-3: Crash reporting aktif
□ P1-4: Keputusan netting
□ P1-5: FONNTE_TOKEN guard

JANGKA MENENGAH (P2):
□ P2-1: Integration tests undian flow
□ P2-2: Period advancement cron
□ P2-3: Group summary endpoint
□ P2-4: RLS audit
```

Total estimasi P0: ~4-5 jam.  
Setelah P0 selesai, sistem bisa menyelesaikan lebih dari 1 periode dan semua mode undian berfungsi.
