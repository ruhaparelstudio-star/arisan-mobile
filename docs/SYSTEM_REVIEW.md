# SYSTEM REVIEW — Arisan App
**Tanggal:** 2026-06-03  
**Fase:** MVP Live  
**Tim:** 1 developer  
**Scope:** arisan-api (Hono/Supabase) + mobile (React Native/Expo)  

---

## Ringkasan Eksekutif

Sistem arisan ini punya fondasi yang solid: stack modern (Hono, Supabase, Expo), data model yang bersih, dan flow utama (auth → buat grup → bayar → undian) sudah jalan di device. Namun ada **3 bug kritis di flow undian** yang membuat Mode 2 dan Mode 3 tidak bisa berjalan di produksi, dan **tidak ada mekanisme untuk melanjutkan ke periode berikutnya** setelah periode 1 selesai — artinya sistem stuck setelah undian pertama.

---

## Skor Per Area

| Area | Skor | Keterangan |
|------|------|------------|
| Undian Flow | 3/10 | Mode 2 bergantung pada RPC yang tidak ada di migration; Mode 3 selalu gagal di backend; tidak ada period advance |
| Arsitektur Backend | 7/10 | Hono + Zod validation bagus, auth middleware clean, tapi tidak ada tests |
| Data Model (DB) | 7/10 | Schema bersih, append-only winners/activity_log, tapi beberapa FK lemah dan RLS belum lengkap |
| Mobile UX | 7/10 | Design system konsisten, offline handling ada, tapi beberapa dead-end navigation |
| Auth & Security | 6/10 | JWT + OTP rate limit ada, tapi Supabase anon key di client, RLS belum menutup semua tabel |
| Observability | 4/10 | Logger ada, tapi tidak ada error tracking aktif (Crashlytics non-fungsional), tidak ada APM |
| Test Coverage | 0/10 | Tidak ada unit test, integration test, atau E2E test sama sekali |

---

## Temuan Kritis (Harus Diperbaiki Sebelum Scale)

### CRIT-1 — Mode 2 (Random): fungsi `undian_random` tidak ada di migration

**File:** `arisan-api/src/services/undian.ts:36`, semua migration files  
**Severity:** CRITICAL

`undianRandom()` memanggil `supabase.rpc('undian_random', { p_group_id: groupId })`. Definisi SQL fungsi ini **hanya ada sebagai komentar di kode**, tidak pernah di-INSERT ke migration manapun (`001_initial.sql` sampai `004_notifications.sql`).

Jika fungsi ini belum dibuat manual di Supabase SQL Editor, semua undian mode random akan mengembalikan `null` → backend return 400 "Tidak ada anggota yang memenuhi syarat" → user bingung padahal data benar.

```sql
-- HARUS ada di migration, bukan di komentar:
CREATE OR REPLACE FUNCTION undian_random(p_group_id UUID) RETURNS UUID AS $$
  SELECT gm.user_id FROM group_members gm
  WHERE gm.group_id = p_group_id
  AND gm.user_id NOT IN (
    SELECT w.user_id FROM winners w WHERE w.group_id = p_group_id
  )
  ORDER BY RANDOM() LIMIT 1;
$$ LANGUAGE SQL;
```

---

### CRIT-2 — Mode 3 (Manual): `setSlotOrder` selalu ditolak backend setelah grup mulai

**File:** `arisan-api/src/routes/groups.ts:209`, `arisan-api/src/services/groups.ts` (isGroupEditable)  
**Severity:** CRITICAL

`PUT /api/groups/:id/urutan` memanggil `isGroupEditable(groupId)` yang return `false` jika ada periode dengan status `active` atau `completed`. Setelah ketua klik "Mulai Arisan", periode 1 langsung dibuat dengan status `active` — sehingga `isGroupEditable` akan selalu return `false`.

Di mobile, UndianScreen mode 3 menampilkan drag-drop UI dan tombol "Simpan Urutan Pemenang" — tapi ketika diklik, backend **selalu return 400** "Urutan tidak bisa diubah setelah arisan berjalan". Mode 3 100% broken di produksi.

**Root cause:** `isGroupEditable` dirancang untuk melindungi urutan setelah arisan berjalan, tapi mode 3 justru membutuhkan ketua set urutan saat atau setelah arisan mulai.

---

### CRIT-3 — Tidak ada mekanisme untuk melanjutkan ke periode berikutnya

**File:** Tidak ada file  
**Severity:** CRITICAL

Tidak ada endpoint `POST /api/groups/:id/close-period` atau sejenisnya di seluruh codebase. Setelah periode 1 selesai undian dan semua bayar, sistem **tidak bisa membuat periode 2**. Artinya:

- Grup dengan `jumlah_periode = 6` hanya bisa menyelesaikan 1 periode
- Tidak ada cara untuk close period aktif dan membuka period berikutnya
- Tidak ada cron job atau trigger yang melakukan advance period

Ini adalah missing flow yang paling fundamental untuk app arisan.

---

## Temuan Signifikan (Medium Priority)

### MED-1 — Mode 3: Winners tidak pernah tercatat di tabel `winners`

**File:** `mobile/src/screens/undian/UndianScreen.tsx:226-240`

Mode 3 hanya memanggil `setSlotOrder()` — tidak pernah memanggil `undianApi.start()`. Akibatnya:
- Tabel `winners` selalu kosong untuk grup mode 3
- `currentPeriodUndianDone`, `hasAnyWinner`, `currentWinnerName` di DetailGrupScreen selalu false/null
- Tombol "Tukar" tidak pernah aktif untuk grup mode 3 (karena `hasAnyWinner` selalu false)
- RiwayatPemenangScreen selalu kosong untuk grup mode 3

---

### MED-2 — `autoConfirmNetting` diimplementasikan tapi tidak pernah dipanggil

**File:** `arisan-api/src/services/undian.ts:61-123`, `arisan-api/src/routes/undian.ts:122-124`

Ada kode lengkap untuk auto-netting (anggota yang sudah pernah menang di periode sebelumnya otomatis dianggap lunas). Tapi di route undian, ada komentar `// NOTE: netting hutang ... TIDAK dijalankan otomatis` dan fungsinya tidak dipanggil. Fitur ini jadi dead code tanpa penjelasan kapan akan diaktifkan.

---

### MED-3 — `push_tokens` tabel tidak ada di migration

**File:** `arisan-api/src/services/notifications.ts:13-31`

`sendExpoPush` query ke tabel `push_tokens` yang tidak ada di satupun migration file. Push notification ke user individu (undian selesai, payment late, dll) kemungkinan besar gagal semua secara silent karena tabel tidak ada.

---

### MED-4 — Dual messaging infrastructure: Stream.io channel + Supabase messages

**File:** `arisan-api/src/services/streamio.ts`, `mobile/src/api/chat.ts`

Backend membuat Stream.io channel per grup (via `createGroupChannel`) tapi mobile **membaca dan menulis pesan langsung ke Supabase `messages` table** — bukan ke Stream.io. Stream.io hanya dipakai untuk broadcast sistem (`sendSystemMessage`). Ini infra ganda yang membayar 2 service untuk fungsi yang sama, dan system messages dari Stream.io tidak selalu muncul di mobile chat (karena mobile baca dari Supabase).

---

### MED-5 — Firebase Crashlytics non-fungsional

**File:** `mobile/App.tsx`, `mobile/google-services.json`

`google-services.json` masih template — bukan file real dari Firebase Console. Crashlytics init akan gagal secara silent. Tidak ada crash reporting aktif di produksi.

---

## Temuan Minor

### MIN-1 — `arisan_amount` selalu 0 di tabel winners

Field `arisan_amount` di Winner interface di-hardcode 0. Tidak ada kalkulasi nominal yang sebenarnya diterima pemenang. Ini berdampak pada UndianResultScreen (`winnerAmount: 0`) dan laporan keuangan jika ditambahkan nanti.

### MIN-2 — Invite code tidak ada expiry check saat join

`POST /api/groups/join` tidak memvalidasi `invite_code_expires_at`. Kode invite yang sudah kedaluwarsa masih bisa dipakai untuk bergabung.

### MIN-3 — `sendWA` via Fonnte: tidak ada fallback jika `FONNTE_TOKEN` tidak di-set

`FONNTE_TOKEN` pakai `process.env.FONNTE_TOKEN!` (non-null assertion). Jika env var tidak di-set di Vercel, semua WA notification function akan throw/fail diam-diam.

### MIN-4 — OTP rate limit di app layer, bukan DB

Rate limiting OTP ada di tabel `otp_rate_limit`, tapi tidak ada unique constraint atau locking yang mencegah race condition (dua request simultan bisa bypass limit).

### MIN-5 — Tidak ada pagination di GET /api/groups/:id/winners

Bisa jadi bottleneck untuk grup dengan banyak periode (>50). Saat ini semua winners di-fetch sekaligus.

---

## Kekuatan Sistem

- **Auth flow solid**: OTP + rate limit + JWT sudah benar, SecureStore di mobile
- **Offline handling**: OfflineBanner, AsyncStorage cache dengan TTL, aksi kritis disabled
- **Zod validation** di semua endpoint — input validation konsisten
- **Activity log append-only**: audit trail yang bersih
- **Design system konsisten**: warna, spacing, komponen sudah terstandardisasi
- **Swap flow lengkap**: 3 jalur (user request → target accept → ketua approve, ketua initiate, auto-approve ketua_pending) sudah terimplementasi
