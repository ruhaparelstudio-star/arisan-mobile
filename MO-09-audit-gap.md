# MO-09 — Audit Gap: Mobile ↔ API Sync Report

> Tanggal audit: 2026-05-30  
> Scope: MO-0 s/d MO-8 vs arisan-api (BE-0 s/d BE-8)  
> Metode: Static analysis — baca seluruh `src/api/*.ts`, semua screen yang memanggil API, dan bandingkan dengan `arisan-api/src/routes/*.ts` + `supabase/migrations/001_initial.sql`

---

## Ringkasan Eksekutif

Dari 8 sesi implementasi, ditemukan **34 gap** antara mobile dan backend. Gap terbagi:

| Severity | Jumlah | Dampak |
|----------|--------|--------|
| 🔴 CRITICAL | 19 | Runtime crash / 404 / data selalu salah |
| 🟠 HIGH | 9 | Silent data loss / wrong data shape |
| 🟡 MEDIUM | 6 | Missing feature / UX degraded |

**Penyebab akar** terbanyak adalah dua hal:
1. **Field name divergence** — mobile memakai konvensi `snake_case` Inggris (`frequency`, `draw_mode`, `created_by`) sementara backend/DB memakai Bahasa Indonesia (`frekuensi`, `mode_undian`, `ketua_id`).
2. **Endpoint belum ada** — beberapa endpoint yang di-call mobile tidak pernah diimplementasikan di backend (chat messages, notifications, winners GET, invite code lookup, dll).

---

## GAP KATEGORI A — AUTH & USERS

### 🟠 GAP-001 · `GET /api/users/me` — Response Tidak Di-Unwrap

| | Mobile | Backend |
|---|---|---|
| File | `src/api/auth.ts:35` | `src/routes/users.ts:14` |
| Response yang diharapkan | `UserProfile` (objek langsung) | `{ user: { id, phone, name, created_at } }` |

Backend membungkus respons dalam `{ user: data }`. Mobile mengharapkan objek langsung tanpa wrapper. Selain itu, mobile mendefinisikan field `push_token` di tipe `UserProfile` padahal backend tidak mengembalikan field tersebut.

**Fix mobile:**
```ts
// src/api/auth.ts
export function getMe(token: string): Promise<UserProfile> {
  return apiCall<{ user: UserProfile }>('/api/users/me', { token })
    .then((r) => r.user);
}
```

---

### 🟠 GAP-002 · `PUT /api/users/me` — Response Shape Mismatch

| | Mobile | Backend |
|---|---|---|
| File | `src/api/auth.ts:39` | `src/routes/users.ts:19` |
| Response yang diharapkan | `UserProfile` | `{ message: 'Profil berhasil diperbarui' }` |

Backend hanya mengembalikan pesan konfirmasi, tidak mengembalikan data user yang telah diupdate. Jika mobile mencoba membaca field dari response, hasilnya `undefined`.

**Fix mobile:** Ganti return type menjadi `{ message: string }`.

---

### 🟠 GAP-003 · `PUT /api/users/push-token` — Payload Field Name Salah

| | Mobile | Backend |
|---|---|---|
| File | `src/api/auth.ts:44` | `src/routes/users.ts:38` |
| Payload yang dikirim | `{ push_token: string }` | `{ expo_push_token: string }` |

Zod validation di backend akan menolak payload karena field `push_token` tidak dikenal. Push token tidak tersimpan → notifikasi push tidak berfungsi.

**Fix mobile:**
```ts
export function updatePushToken(token: string, pushToken: string) {
  return apiCall('/api/users/push-token', {
    method: 'PUT',
    body: JSON.stringify({ expo_push_token: pushToken }), // <-- fix
    token,
  });
}
```

---

## GAP KATEGORI B — GROUPS

### 🔴 GAP-004 · `GET /api/groups` — Response Tidak Di-Unwrap

| | Mobile | Backend |
|---|---|---|
| File | `src/api/groups.ts:34`, `HomeScreen.tsx:48`, `GroupsScreen.tsx:31` | `src/routes/groups.ts:57` |
| Response yang diharapkan | `Group[]` (array langsung) | `{ groups: [...] }` |

HomeScreen dan GroupsScreen keduanya memanggil `setGroups(data)` langsung. Karena `data` adalah `{ groups: [...] }`, state `groups` menjadi objek bukan array. Semua render yang melakukan `.map()` di state ini akan crash.

**Fix mobile:**
```ts
export function getMyGroups(token: string): Promise<Group[]> {
  return apiCall<{ groups: Group[] }>('/api/groups', { token })
    .then((r) => r.groups);
}
```

---

### 🔴 GAP-005 · `GET /api/groups/:id` — Response Shape Mismatch + Missing Fields

| | Mobile | Backend |
|---|---|---|
| File | `src/api/groups.ts:36`, `DetailGrupScreen.tsx`, `UndianScreen.tsx`, dll | `src/routes/groups.ts:111` |
| Response yang diharapkan | `GroupDetail` (merged: `{ ...group, members, current_period }`) | `{ group, members }` (terpisah, tanpa `current_period`) |

Backend mengembalikan `{ group, members }` terpisah. Mobile mengharapkan satu objek gabungan dengan field tambahan `current_period`. Selain itu, format member dari backend adalah:

```json
{ "urutan": 1, "users": { "id": "...", "name": "...", "phone": "..." } }
```

Sedangkan mobile memakai:
```ts
interface GroupMember { slot_order: number | null; user: { name, phone } }
```

Tiga perbedaan sekaligus: wrapper key (`users` vs `user`), field name (`urutan` vs `slot_order`), dan `current_period` tidak ada.

**Dampak downstream:**
- `DetailGrupScreen.tsx:54` — `isKetua` selalu `false` karena `group.created_by` adalah `undefined`
- `DetailGrupScreen.tsx:251` — `group.total_periods` → `undefined`
- `UndianScreen.tsx:50` — `group.members` tidak terbaca dengan benar
- `RequestSwapScreen.tsx:57-58` — filter `slot_order` gagal karena field undefined

**Fix mobile:**
```ts
export function getGroupDetail(token: string, groupId: string): Promise<GroupDetail> {
  return apiCall<{ group: RawGroup; members: RawMember[] }>(`/api/groups/${groupId}`, { token })
    .then(({ group, members }) => ({
      ...group,
      created_by: group.ketua_id,        // remap
      frequency: group.frekuensi,
      total_periods: group.jumlah_periode,
      draw_mode: group.mode_undian,
      current_period: 1,                  // sementara; lihat GAP-008
      members: members.map((m) => ({
        ...m,
        slot_order: m.urutan,
        user: m.users,
      })),
    }));
}
```

---

### 🔴 GAP-006 · `POST /api/groups` — Payload Field Names Salah Semua

| | Mobile | Backend (Zod schema) |
|---|---|---|
| File | `src/api/groups.ts:40`, `BuatGrupStep3Screen.tsx:47` | `src/routes/groups.ts:16` |

```
Mobile mengirim:          Backend mengharapkan:
{ name }              ←→  { name }          ✓
{ nominal }           ←→  { nominal }       ✓
{ frequency }         ←→  { frekuensi }     ✗ MISMATCH
{ total_periods }     ←→  { jumlah_periode }✗ MISMATCH
{ draw_mode }         ←→  { mode_undian }   ✗ MISMATCH
```

Zod validation di backend akan mengembalikan 400 setiap kali user mencoba membuat grup. **Fitur buat grup tidak bisa digunakan sama sekali.**

---

### 🔴 GAP-007 · `draw_mode: 'offline'` Tidak Valid di Backend

| | Mobile | Backend |
|---|---|---|
| File | `BuatGrupStep3Screen.tsx:29,47` | `src/routes/groups.ts:20` |
| Nilai yang dikirim | `'offline'` | `z.enum(['fixed', 'random', 'manual'])` |

Mobile menampilkan pilihan "Undian offline" dengan value `'offline'`. Backend menggunakan value `'manual'`. Pilihan ini akan selalu ditolak dengan 400.

**Fix mobile:** Ubah value dari `'offline'` ke `'manual'` di `DRAW_OPTIONS` konstanta.

---

### 🔴 GAP-008 · `GroupDetail.current_period` Tidak Dikembalikan Backend

| | Mobile | Backend |
|---|---|---|
| File | `DetailGrupScreen.tsx:251,282`, `RequestSwapScreen.tsx:61` | Tidak ada |

Backend tidak pernah menghitung atau mengembalikan `current_period`. Field ini selalu `undefined` di semua screen yang menggunakannya. Navigasi ke UndianPre memakai `periodId: 'p1'` (hardcoded string — bukan UUID valid).

**Fix backend:** Tambahkan query period aktif saat GET group detail:
```ts
const { data: activePeriod } = await supabase
  .from('periods')
  .select('id, periode_ke')
  .eq('group_id', groupId)
  .eq('status', 'active')
  .single();
```
Kemudian sertakan `current_period_id` dan `current_period` di response.

---

### 🔴 GAP-009 · `GET /api/groups/code/:invite_code` — Endpoint Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/groups.ts:59`, `JoinConfirmScreen.tsx:27` | Tidak terdaftar |

`JoinConfirmScreen` memanggil `getGroupByCode` untuk preview grup sebelum join. Endpoint `GET /api/groups/code/:invite_code` tidak ada di backend. Seluruh alur join group (preview) akan selalu 404.

**Fix backend:** Tambahkan endpoint di `groups.ts`:
```ts
groupsRoute.get('/code/:code', async (c) => {
  const { code } = c.req.param();
  const { data: group } = await supabase
    .from('groups')
    .select('*, group_members(count)')
    .eq('invite_code', code.toUpperCase())
    .single();
  if (!group) return c.json({ error: 'Kode tidak valid' }, 404);
  return c.json({ ...group, member_count: group.group_members[0].count });
});
```

---

### 🔴 GAP-010 · `POST /api/groups/:id/invite` — Endpoint Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/groups.ts:74`, `DetailGrupScreen.tsx:handleGenerateInvite` | Tidak terdaftar |

Mobile memungkinkan ketua regenerate kode invite dari `DetailGrupScreen`. Backend tidak punya endpoint ini. Tombol "Generate Kode" di detail grup akan selalu 404.

**Fix backend:** Tambahkan endpoint di `groups.ts`:
```ts
groupsRoute.post('/:id/invite', async (c) => {
  const userId = c.get('userId');
  const groupId = c.req.param('id');
  const { data: group } = await supabase
    .from('groups').select('ketua_id').eq('id', groupId).single();
  if (!group || group.ketua_id !== userId)
    return c.json({ error: 'Hanya ketua yang bisa generate kode' }, 403);
  const newCode = await gs.generateInviteCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await supabase.from('groups')
    .update({ invite_code: newCode, invite_code_expires_at: expiresAt })
    .eq('id', groupId);
  return c.json({ invite_code: newCode });
});
```

---

### 🔴 GAP-011 · `PUT /api/groups/:id/slot-order` — Endpoint Salah URL + Payload

| | Mobile | Backend |
|---|---|---|
| File | `src/api/groups.ts:82`, `SetGiliranScreen.tsx:57` | `src/routes/groups.ts` — `PUT /:id/urutan` |
| URL | `/api/groups/:id/slot-order` | `/api/groups/:id/urutan` |
| Payload | `{ order: string[] }` | `{ urutan: string[] }` |

URL dan nama field payload keduanya salah. SetGiliranScreen akan selalu 404.

**Fix mobile:**
```ts
export function setSlotOrder(token: string, groupId: string, order: string[]) {
  return apiCall(`/api/groups/${groupId}/urutan`, {  // fix URL
    method: 'PUT',
    body: JSON.stringify({ urutan: order }),          // fix field name
    token,
  });
}
```

---

## GAP KATEGORI C — PAYMENTS

### 🔴 GAP-012 · `GET /api/groups/:id/periods` — Endpoint Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/payments.ts:46`, `PaymentStatusScreen.tsx:74`, `PaymentHistoryScreen.tsx:46` | Tidak terdaftar |

Mobile memanggil `getPeriods(token, groupId)` → `GET /api/groups/${groupId}/periods`. Backend tidak punya endpoint ini. PaymentStatusScreen dan PaymentHistoryScreen akan 404 setiap load.

**Fix backend:** Tambahkan di `groups.ts`:
```ts
groupsRoute.get('/:id/periods', async (c) => {
  const { id: groupId } = c.req.param();
  const { data } = await supabase
    .from('periods')
    .select('*')
    .eq('group_id', groupId)
    .order('periode_ke');
  return c.json({ periods: data ?? [] });
});
```
Dan fix mobile untuk memakai field `periode_ke`, `jatuh_tempo` bukan `period_number`, `due_date`.

---

### 🔴 GAP-013 · `getPayments` — URL Prefix Salah

| | Mobile | Backend |
|---|---|---|
| File | `src/api/payments.ts:26` | `src/routes/payments.ts` + `src/index.ts:12` |
| URL mobile | `GET /api/groups/:gid/periods/:pid/payments` | `GET /api/payments/:gid/:pid` |

Route payments didaftarkan di `app.route('/api/payments', paymentsRoute)` bukan di groups. Mobile memanggil path yang salah. Akan selalu 404.

**Fix mobile:**
```ts
export function getPayments(token: string, groupId: string, periodId: string) {
  return apiCall<{ payments: Payment[] }>(`/api/payments/${groupId}/${periodId}`, { token })
    .then((r) => r.payments);
}
```

---

### 🔴 GAP-014 · `confirmPayment` / `cancelConfirm` — URL Prefix Salah

| | Mobile | Backend |
|---|---|---|
| File | `src/api/payments.ts:32,43` | `src/routes/payments.ts` |
| URL mobile | `/api/groups/:gid/periods/:pid/confirm` | `/api/payments/:gid/:pid/confirm` |

Sama seperti GAP-013. Semua aksi konfirmasi/batal bayar akan 404.

**Fix mobile:** Ubah prefix URL dari `/api/groups/` ke `/api/payments/`.

---

### 🟠 GAP-015 · `getPayments` — Response Tidak Di-Unwrap

| | Mobile | Backend |
|---|---|---|
| File | `src/api/payments.ts:26`, `PaymentStatusScreen.tsx:72` | `src/routes/payments.ts:20` |

Backend mengembalikan `{ payments: data }`. Mobile mengharapkan `Payment[]` langsung. State `rawPayments` akan berisi objek, bukan array.

---

### 🟠 GAP-016 · `Period` Type — Field Names Mismatch dengan DB

| Mobile Type | DB Column |
|---|---|
| `period_number` | `periode_ke` |
| `due_date` | `jatuh_tempo` |
| `winner_user_id` | Tidak ada di `periods` table |
| `status: 'open'\|'closed'` | `status: 'upcoming'\|'active'\|'completed'` |

`PaymentStatusScreen.tsx:141` membandingkan `period.due_date` dan `PaymentStatusScreen.tsx:202` merender `period.due_date` — keduanya akan `undefined`. Label jatuh tempo tidak pernah tampil.

---

### 🟠 GAP-017 · `Payment.group_id` Tidak Ada di DB

Mobile mendefinisikan `group_id` di tipe `Payment` (`src/api/payments.ts:6`) tapi tabel `payments` di DB tidak punya kolom tersebut. Field ini tidak pernah tersedia dari API.

---

### 🟠 GAP-018 · Realtime Update Menghilangkan Field `user`

`usePaymentRealtime.ts:30` menerima event Supabase Realtime dari tabel `payments`. Supabase Realtime hanya mengirim kolom dari tabel yang berubah — tidak ada JOIN ke `users`. Tipe `Payment` punya `user: { name, phone }` dari initial fetch, tapi saat realtime update merges `payload.new as Payment`, field `user` hilang (jadi `undefined`).

Nama anggota di PaymentStatusScreen akan kosong setelah realtime update masuk.

---

## GAP KATEGORI D — UNDIAN

### 🔴 GAP-019 · `GET /api/groups/:id/winners` — Endpoint Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/undian.ts:16`, `UndianScreen.tsx:45`, `RiwayatPemenangScreen.tsx:40` | Tidak terdaftar |

Backend hanya punya `POST /:id/undian`. Tidak ada GET endpoint untuk riwayat pemenang. Undian history selalu 404. UndianScreen tidak bisa filter kandidat yang sudah menang.

**Fix backend:** Tambahkan di `undian.ts`:
```ts
undianRoute.get('/:id/winners', async (c) => {
  const groupId = c.req.param('id');
  const { data } = await supabase
    .from('winners')
    .select('id, user_id, created_at, period_id, periods(periode_ke), users(name, phone)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  return c.json({ winners: data ?? [] });
});
```

---

### 🟠 GAP-020 · `Winner` Type — Fields Tidak Ada di DB

| Mobile Type | DB Column (`winners` table) |
|---|---|
| `period_number` | Tidak ada (perlu JOIN ke `periods.periode_ke`) |
| `winner_name` | Tidak ada (perlu JOIN ke `users.name`) |
| `arisan_amount` | Tidak ada sama sekali di DB |
| `drawn_at` | Tidak ada (field ini adalah `created_at`) |

`RiwayatPemenangScreen.tsx:41` sort berdasarkan `period_number` yang `undefined`. Semua row akan render kosong.

---

### 🔴 GAP-021 · `UndianScreen` — `periodId: 'p1'` Bukan UUID Valid

`DetailGrupScreen.tsx:282`:
```ts
navigation.navigate('UndianPre', { 
  periodId: 'p1',  // ← bukan UUID!
  ...
});
```

Backend undian route (`undianSchema`) memvalidasi `period_id` sebagai `z.string().uuid()`. Nilai `'p1'` akan selalu gagal validasi → 400. **Fitur undian tidak bisa dijalankan.**

**Fix:** Harus pass UUID dari period aktif. Butuh GAP-008 (current_period_id) diselesaikan dulu.

---

## GAP KATEGORI E — SWAPS

### 🟠 GAP-022 · `POST /api/swaps` — Response Tidak Di-Unwrap

| | Mobile | Backend |
|---|---|---|
| File | `src/api/swaps.ts:12` | `src/routes/swaps.ts:55` |
| Response yang diharapkan | `Swap` (langsung) | `{ swap: result.swap }` (wrapped, status 201) |

Mobile menge-type response sebagai `Swap` langsung. Backend membungkus dalam `{ swap }`. Akan ada silent mismatch di konsumer.

---

### 🟠 GAP-023 · `POST /api/swaps/:id/respond` — Response Shape Mismatch

| | Mobile | Backend |
|---|---|---|
| File | `src/api/swaps.ts:18` | `src/routes/swaps.ts:70` |
| Response yang diharapkan | `{ message: string }` | `{ status: result.status }` |

Mobile menampilkan `message` dari response tapi backend mengembalikan `status`. Tidak ada error runtime tapi feedback ke user salah/kosong.

---

### 🟠 GAP-024 · `Swap.requester_period` dan `target_period` Tidak Ada di DB

| Mobile Type | DB Column (`swap_requests`) |
|---|---|
| `requester_period` | Tidak ada |
| `target_period` | Tidak ada |

`RequestSwapScreen.tsx:171` menampilkan `P${myPeriod} ↔ P${target.slot_order}`. Nilai ini dari local state, bukan dari DB. Tapi `Swap` type yang di-return dari `/api/swaps/my` tidak punya field ini — menyebabkan inkonsistensi jika data swap di-refresh.

---

### 🟠 GAP-025 · `Swap.requester` dan `Swap.target` — User Detail Tidak Di-return

Backend `GET /api/swaps/my` dan `GET /api/swaps/group/:id` melakukan:
```ts
supabase.from('swap_requests').select('*')
```
Tidak ada JOIN ke `users`. Field `requester` dan `target` di tipe mobile akan selalu `undefined`. SwapInboxScreen dan SwapApprovalScreen tidak bisa menampilkan nama anggota.

**Fix backend:** Ubah query menjadi:
```ts
.select('*, requester:users!requester_id(name, phone), target:users!target_id(name, phone)')
```

---

## GAP KATEGORI F — CHAT & NOTIFICATIONS

### 🔴 GAP-026 · `GET/POST /api/groups/:id/messages` — Endpoint Tidak Ada, Tabel Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/chat.ts:33,42`, `ChatScreen.tsx` | Tidak terdaftar |

ChatScreen memanggil `getMessages` dan `sendMessage` ke endpoint ini. Backend tidak punya endpoint dan tidak ada tabel `messages` di DB. Chat tidak berfungsi sama sekali.

> **Catatan MO-6:** Stream.io diputuskan tidak dipakai. Chat diganti dengan polling REST sendiri. Tapi endpoint REST-nya tidak pernah dibuat di backend.

**Fix:** Butuh implementasi full — tabel `messages`, endpoint GET (dengan pagination `before`) dan POST, serta pertimbangan scalability (polling vs realtime).

---

### 🔴 GAP-027 · `GET /api/groups/:id/activity-log` — Endpoint Tidak Ada

| | Mobile | Backend |
|---|---|---|
| File | `src/api/chat.ts:54`, `ActivityLogScreen.tsx` | Tidak terdaftar |

Backend punya service `logActivity()` yang menulis ke tabel `activity_log`, tapi tidak ada endpoint REST untuk membacanya. ActivityLogScreen akan selalu 404.

**Fix backend:** Tambahkan di `groups.ts`:
```ts
groupsRoute.get('/:id/activity-log', async (c) => {
  const groupId = c.req.param('id');
  const limit = parseInt(c.req.query('limit') ?? '30');
  const offset = parseInt(c.req.query('offset') ?? '0');
  const { data, count } = await supabase
    .from('activity_log')
    .select('*, actor:users!actor_id(name)', { count: 'exact' })
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return c.json({ entries: data ?? [], has_more: (count ?? 0) > offset + limit });
});
```

---

### 🔴 GAP-028 · `GET/POST /api/notifications` — Route Tidak Terdaftar

| | Mobile | Backend |
|---|---|---|
| File | `src/api/notifications.ts`, `NotificationsScreen.tsx:63` | Tidak ada di `src/index.ts` |

Backend `src/index.ts` tidak mendaftarkan route untuk notifikasi. Tabel `notif_log` di DB adalah log dedup pengiriman push, bukan inbox notifikasi user. NotificationsScreen akan selalu 404.

**Fix:** Perlu desain ulang — apakah notifikasi disimpan ke tabel baru `notifications` (inbox) atau hanya push-only. Backend harus tambahkan route dan (mungkin) tabel baru.

---

### 🟠 GAP-029 · `ActivityLogEntry` Type — Struktur Tidak Match DB

Mobile `ActivityLogEntry`:
```ts
{ id, icon, tone: 'mint'|'blue'|'neutral'|'amber', text, created_at }
```

DB `activity_log`:
```
{ id, group_id, actor_id, action, description, created_at }
```

Field `icon` dan `tone` tidak ada di DB. Backend harus memetakan `action` ke icon+tone, dan `description` ke `text` sebelum dikirim ke mobile.

---

## GAP KATEGORI G — FITUR BACKEND YANG BELUM ADA DI MOBILE

### 🟡 GAP-030 · `PUT /api/groups/:groupId/periods/:periodId/tanggal` — Tidak Ada di Mobile

Backend (BE-5) mengimplementasikan endpoint untuk ketua mengatur tanggal pelaksanaan per periode. Mobile tidak punya screen atau API call untuk ini. Ketua tidak bisa mengatur jadwal dari mobile.

---

### 🟡 GAP-031 · `DELETE /api/users/me` — Tidak Ada di Mobile

Backend (BE-8) mengimplementasikan penghapusan akun (anonymization sesuai UU PDP). Mobile tidak expose fitur ini. Pengguna tidak bisa hapus akun dari mobile — potensi pelanggaran regulasi.

---

### 🟡 GAP-032 · `GET /api/users/stream-token` — Tidak Digunakan

Backend punya endpoint ini (BE-5.5). Mobile memutuskan tidak pakai Stream.io (MO-6), ganti dengan polling REST custom. Endpoint ini menjadi dead code di backend.

---

### 🟡 GAP-033 · `disbandGroup` — Status `disbanded` Tidak Dihandle Mobile

Backend mengubah status grup menjadi `disbanded` saat dibubarkan. Mobile `Group.status` type hanya mendefinisikan `'recruiting' | 'active' | 'completed'`. Status `disbanded` tidak dihandle — grup yang dibubarkan mungkin masih tampil dengan tampilan aneh di daftar grup.

---

### 🟡 GAP-034 · `GroupDetail.members` — Nested Key `users` vs `user`

Backend query di `GET /api/groups/:id`:
```ts
.select('urutan, users(id, name, phone)')
```

Supabase mengembalikan key sesuai nama tabel: `users`, bukan `user`. Mobile type `GroupMember` mendefinisikan `user: { name, phone }`. Akses `member.user.name` akan `undefined` karena field-nya adalah `member.users`.

---

## Tabel Ringkasan Semua Gap

| ID | Area | Severity | Masalah | Fix Di |
|----|------|----------|---------|--------|
| GAP-001 | Users | 🟠 HIGH | `GET /me` response unwrap missing | Mobile |
| GAP-002 | Users | 🟠 HIGH | `PUT /me` response mismatch | Mobile |
| GAP-003 | Users | 🟠 HIGH | Push token field name `push_token` vs `expo_push_token` | Mobile |
| GAP-004 | Groups | 🔴 CRITICAL | `GET /groups` response unwrap missing | Mobile |
| GAP-005 | Groups | 🔴 CRITICAL | `GET /groups/:id` shape mismatch + 3 field remap | Mobile + Backend |
| GAP-006 | Groups | 🔴 CRITICAL | `POST /groups` 3 field names salah | Mobile |
| GAP-007 | Groups | 🔴 CRITICAL | `draw_mode: 'offline'` tidak valid | Mobile |
| GAP-008 | Groups | 🔴 CRITICAL | `current_period` tidak dikembalikan backend | Backend |
| GAP-009 | Groups | 🔴 CRITICAL | `GET /groups/code/:code` endpoint tidak ada | Backend |
| GAP-010 | Groups | 🔴 CRITICAL | `POST /groups/:id/invite` endpoint tidak ada | Backend |
| GAP-011 | Groups | 🔴 CRITICAL | `PUT /groups/:id/slot-order` URL + payload salah | Mobile |
| GAP-012 | Payments | 🔴 CRITICAL | `GET /groups/:id/periods` endpoint tidak ada | Backend |
| GAP-013 | Payments | 🔴 CRITICAL | `getPayments` URL prefix salah (`/groups/` vs `/payments/`) | Mobile |
| GAP-014 | Payments | 🔴 CRITICAL | `confirmPayment/cancelConfirm` URL prefix salah | Mobile |
| GAP-015 | Payments | 🟠 HIGH | `getPayments` response unwrap missing | Mobile |
| GAP-016 | Payments | 🟠 HIGH | `Period` field names mismatch | Mobile |
| GAP-017 | Payments | 🟠 HIGH | `Payment.group_id` tidak ada di DB | Mobile |
| GAP-018 | Payments | 🟠 HIGH | Realtime update menghilangkan field `user` | Mobile |
| GAP-019 | Undian | 🔴 CRITICAL | `GET /groups/:id/winners` endpoint tidak ada | Backend |
| GAP-020 | Undian | 🟠 HIGH | `Winner` type field names tidak match DB | Mobile + Backend |
| GAP-021 | Undian | 🔴 CRITICAL | `periodId: 'p1'` bukan UUID valid | Mobile |
| GAP-022 | Swaps | 🟠 HIGH | `POST /swaps` response unwrap missing | Mobile |
| GAP-023 | Swaps | 🟠 HIGH | `POST /swaps/:id/respond` response mismatch | Mobile |
| GAP-024 | Swaps | 🟡 MEDIUM | `requester_period`/`target_period` tidak di DB | Mobile |
| GAP-025 | Swaps | 🟠 HIGH | Swap user details tidak di-JOIN di backend | Backend |
| GAP-026 | Chat | 🔴 CRITICAL | `/groups/:id/messages` endpoint tidak ada, tabel tidak ada | Backend |
| GAP-027 | Chat | 🔴 CRITICAL | `/groups/:id/activity-log` endpoint tidak ada | Backend |
| GAP-028 | Notif | 🔴 CRITICAL | `/api/notifications` route tidak terdaftar | Backend |
| GAP-029 | Chat | 🟠 HIGH | `ActivityLogEntry` icon/tone tidak ada di DB | Backend |
| GAP-030 | Groups | 🟡 MEDIUM | Tanggal pelaksanaan endpoint tidak di mobile | Mobile |
| GAP-031 | Users | 🟡 MEDIUM | Hapus akun endpoint tidak di mobile | Mobile |
| GAP-032 | Chat | 🟡 MEDIUM | Stream.io token endpoint dead code | Backend |
| GAP-033 | Groups | 🟡 MEDIUM | Status `disbanded` tidak dihandle mobile | Mobile |
| GAP-034 | Groups | 🟠 HIGH | `member.users` vs `member.user` nested key | Mobile |

---

## Urutan Prioritas Fix (Recommended Sprint MO-09)

### Sprint 1 — Unblock Core Flow (1–2 hari)
Fix gap yang membuat fitur utama sama sekali tidak bisa dijalankan:

1. **GAP-004** + **GAP-015** — unwrap `groups` dan `payments` response
2. **GAP-005** + **GAP-034** — remap group + member fields
3. **GAP-006** + **GAP-007** — fix createGroup payload
4. **GAP-008** + **GAP-021** — tambah `current_period` + pass UUID ke undian
5. **GAP-013** + **GAP-014** — fix payments URL prefix
6. **GAP-011** — fix slot-order URL + payload

### Sprint 2 — Backend Missing Endpoints (1 hari)
Endpoint yang harus dibuat di backend:

7. **GAP-009** — `GET /groups/code/:code`
8. **GAP-010** — `POST /groups/:id/invite`
9. **GAP-012** — `GET /groups/:id/periods`
10. **GAP-019** — `GET /groups/:id/winners`
11. **GAP-027** — `GET /groups/:id/activity-log`

### Sprint 3 — Data Shape Polish (1 hari)
12. **GAP-003** — push token field name
13. **GAP-016** + **GAP-020** — Period + Winner type remap
14. **GAP-025** — JOIN users di swaps query
15. **GAP-018** — realtime payment user field preservation
16. **GAP-028** + **GAP-026** — notifications + chat design decision

### Sprint 4 — Compliance & UX
17. **GAP-031** — hapus akun (UU PDP)
18. **GAP-030** — tanggal pelaksanaan UI
19. **GAP-033** — status `disbanded` handling

---

## Catatan Arsitektur

Akar masalah field name divergence bisa diselesaikan dengan **salah satu** dari dua pendekatan:

**Opsi A — Remap di Mobile (lebih cepat):** Buat adapter layer di `src/api/*.ts` yang memetakan response backend ke tipe internal mobile. Backend tidak perlu berubah. Cocok untuk sprint cepat.

**Opsi B — Normalize Backend (lebih bersih, jangka panjang):** Ubah backend untuk mengembalikan `created_by`, `frequency`, `total_periods`, `draw_mode` alih-alih nama Indonesia. Ini breaking change tapi membuat kontrak API konsisten untuk masa depan (web dashboard, partner API, dll).

Rekomendasi: **Opsi A sekarang + Opsi B di BE-09 sebagai refactor tersendiri.**
