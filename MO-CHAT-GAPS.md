# Chat Feature — Gap Documentation

> Dibuat: 2026-05-31
> Branch: develop
> Scope: Audit kesesuaian ChatScreen vs design bundle V2 + status realtime

---

## Status Realtime

Realtime sudah diimplementasikan via **Supabase Realtime** (bukan polling). Arsitektur saat ini:

| Alur | Mekanisme | File |
|------|-----------|------|
| Load pesan awal | Supabase JS query + JOIN `users` | `src/api/chat.ts:41-88` |
| Pesan masuk realtime | `postgres_changes` INSERT filtered `group_id` | `src/api/chat.ts:91-118` |
| Kirim pesan | REST POST `/api/groups/:id/messages` | `src/api/chat.ts:121-131` |
| Optimistic update + dedupe | Tambah ke state lokal, skip jika `id` sudah ada | `src/screens/chat/ChatScreen.tsx:103-108` |

### Prasyarat Realtime Berjalan

Realtime **hanya aktif** jika dua env berikut terisi di `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Jika kosong, `supabase` client adalah `null` dan:
- `fetchMessages()` → return `{ messages: [], has_more: false }` tanpa error — chat tampak kosong
- `subscribeMessages()` → return no-op — tidak ada realtime
- Tidak ada REST fallback untuk membaca pesan

---

## Gap Visual vs Design Bundle V2

### GAP-CHAT-01 — Pinned Banner Hardcoded

**File:** [src/screens/chat/ChatScreen.tsx:185-189](src/screens/chat/ChatScreen.tsx#L185-L189)

**Design:** Banner menampilkan data nyata dari periode aktif.
```
Periode 4: Andi menang · 7/12 lunas · H-2
```

**Implementasi saat ini:**
```tsx
<Text style={styles.pinnedText}>Periode aktif · Tap untuk detail</Text>
```

**Masalah:** Teks hardcoded. Route params `Chat` tidak membawa data periode (winner, paidCount, dueDate).

**Fix yang dibutuhkan:**
1. Tambah params ke route `Chat` di [src/navigation/types.ts:27](src/navigation/types.ts#L27):
   ```ts
   Chat: {
     groupId: string;
     groupName: string;
     memberCount: number;
     ketuaId: string;
     periodNumber?: number;
     winnerName?: string;
     paidCount?: number;
     dueDate?: string;
   };
   ```
2. Pass data dari `DetailGrupScreen` saat navigasi ke Chat.
3. Render banner dinamis berdasarkan params tersebut.

---

### GAP-CHAT-02 — Tidak Ada Date Divider

**File:** [src/screens/chat/ChatScreen.tsx:208](src/screens/chat/ChatScreen.tsx#L208) (area FlatList render)

**Design:** Ada separator teks "Hari ini" di antara grup pesan berdasarkan tanggal kalender.

**Implementasi saat ini:** FlatList merender item langsung tanpa pemisah tanggal.

**Fix yang dibutuhkan:**
- Tambah fungsi `groupByDate(messages)` yang menyisipkan item header `{ type: 'date-divider', label: 'Hari ini' }` sebelum grup pesan per tanggal.
- `renderItem` perlu handle tipe `date-divider`.

---

### GAP-CHAT-03 — Empty State Tidak Sesuai Design

**File:** [src/screens/chat/ChatScreen.tsx:218-222](src/screens/chat/ChatScreen.tsx#L218-L222)

**Design (`hifi-states.jsx`):**
```
StateView
  icon="message"
  tone="mint"
  title="Belum ada obrolan"
  body="Jadi yang pertama menyapa! Event sistem seperti undian & konfirmasi bayar juga akan tampil di sini."
```

**Implementasi saat ini:**
```tsx
<Text style={styles.emptyText}>Belum ada pesan. Mulai ngobrol!</Text>
```

**Fix yang dibutuhkan:** Ganti inline `Text` dengan komponen `StateView` yang sudah ada:
```tsx
<StateView
  icon="message"
  tone="mint"
  title="Belum ada obrolan"
  body="Jadi yang pertama menyapa! Event sistem seperti undian & konfirmasi bayar juga akan tampil di sini."
/>
```

---

## Catatan Tambahan

### user_name untuk Pesan Realtime

Saat pesan realtime masuk via Supabase (tanpa JOIN users), `user_name` diambil dari `userNameCache` — sebuah `useRef` yang diisi dari 30 pesan awal. Jika pengirim baru belum pernah muncul di 30 pesan pertama, namanya akan tampil sebagai "Anggota".

Ini edge case minor — acceptable untuk MVP, bisa diperbaiki dengan menambahkan endpoint `GET /api/users/:id` dan fetch per pesan baru jika tidak ada di cache.

### Stream.io Tidak Diinstall

`EXPO_PUBLIC_STREAM_API_KEY` di `.env` saat ini tidak dipakai oleh kode manapun. Keputusan di sesi MO-06: `stream-chat-expo` tidak jadi diinstall, chat dibangun langsung di atas Supabase + REST. Env var ini aman untuk dikosongkan.

---

## Prioritas Fix

| Gap | Dampak UX | Effort | Prioritas |
|-----|-----------|--------|-----------|
| GAP-CHAT-01 (pinned banner) | Sedang — info periode tidak tampil | Medium | P2 |
| GAP-CHAT-02 (date divider) | Rendah — kosmetik | Low | P3 |
| GAP-CHAT-03 (empty state) | Rendah — kosmetik | Low | P3 |
| Supabase env kosong | **Kritis** — chat tidak berfungsi sama sekali | — | **P0** |
