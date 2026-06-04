# BUG — ChatScreen Nama User Tampil "Anggota"

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Device testing 2026-06-03  
**File:** `src/screens/chat/ChatScreen.tsx`, `src/api/chat.ts`

## Masalah

Nama pengirim pesan di ChatScreen tampil sebagai "Anggota" alih-alih nama asli (misalnya "Aris").

## Root Cause

`fetchMessages()` menggunakan Supabase JS dengan embedded JOIN:
```typescript
.select('..., user:users!user_id(name, phone)')
```

Karena mobile menggunakan **anon key** Supabase (bukan user JWT), RLS pada tabel `users` kemungkinan memblokir embedded join → `r.user = null` → fallback ke `'Anggota'`.

## Fix yang Diterapkan

`ChatScreen.loadMessages()` sekarang fetch `getGroupDetail()` secara paralel dengan `fetchMessages()`. Member list dari group detail digunakan untuk **seed** `userNameCache` sebelum memproses pesan:

```typescript
// Seed cache dari group members (via REST API dengan user JWT)
if (groupDetail) {
  for (const m of groupDetail.members) {
    const name = m.user.name ?? m.user.phone;
    if (m.user_id && name) userNameCache.current[m.user_id] = name;
  }
}

// Enrich pesan yang dapat fallback 'Anggota'
const enriched = res.messages.map((m) =>
  m.user_name === 'Anggota' && userNameCache.current[m.user_id]
    ? { ...m, user_name: userNameCache.current[m.user_id] }
    : m,
);
```

Nama cache tidak lagi menyimpan string `'Anggota'` (nilai fallback yang tidak reliable).

## Trade-off

- +1 API call saat buka ChatScreen (getGroupDetail)
- Dampak minimal: `getGroupDetail` biasanya sudah cached dari DetailGrupScreen (TTL 24 jam AsyncStorage)
- Benefit: nama semua anggota tampil benar, tidak ada "Anggota" untuk user yang ada di grup

## Fix Backend (Opsional, Jangka Panjang)

Tambahkan Supabase RLS policy `SELECT` di tabel `users` untuk kolom `name` saja (bukan `phone`) agar anon key bisa embed JOIN. Tapi ini memerlukan review keamanan.
