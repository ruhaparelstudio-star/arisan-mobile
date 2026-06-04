# GAP — N+1 API Calls di GroupsScreen

**Severity:** Medium (Performa)  
**Status:** Butuh perubahan backend  
**File:** `src/screens/groups/GroupsScreen.tsx`

## Masalah

`GroupsScreen` melakukan N+1 API calls setiap kali tab Grup difokus:
1. `GET /api/groups` → list semua grup
2. `GET /api/groups/:id` × N → detail setiap grup (parallel)

Untuk user dengan 10 grup → 11 API calls setiap kali tab dibuka.

```typescript
const details = await Promise.all(
  list.map((g) => getGroupDetail(token, g.id).catch(() => null)),
);
```

## Dampak

- Beban server tidak perlu (N requests per user per navigasi)
- UI lambat di koneksi lemah (meski parallel, latency tetap tinggi)
- Rate limiting backend bisa terpicu untuk user dengan banyak grup

## Solusi

### Opsi A — Enriched List Endpoint (Rekomendasi, Butuh Backend)
Backend ubah `GET /api/groups` untuk menyertakan `member_count` dan `current_period` langsung di list response.

```json
{
  "groups": [{
    "id": "...",
    "name": "Arisan RT",
    "member_count": 8,
    "current_period": 3,
    ...
  }]
}
```

Mobile tidak perlu call `getGroupDetail()` lagi untuk GroupsScreen.

### Opsi B — Cache Agresif (Workaround Mobile)
Gunakan cache detail dari screen lain (DetailGrupScreen sudah cache per grup). GroupsScreen baca dari cache dulu, refresh di background.

**Status:** Opsi B diimplementasikan penuh — GroupsScreen sekarang cache-first:
1. Baca `cache.get(groupDetail(id))` untuk semua grup secara paralel
2. Set state langsung dari cache → UI responsif tanpa menunggu network
3. Fetch background hanya untuk grup yang cache-nya stale atau kosong
4. Update state setelah fresh data tiba

Ini mengurangi perceived latency dari ~N×API_LATENCY menjadi ~0 (dari cache) + background refresh.  
Opsi A (enriched backend response) tetap direkomendasikan untuk mengurangi beban server.

## Langkah Backend
1. Tambah subquery `COUNT(group_members.*)` ke query `GET /api/groups`
2. Tambah field `current_period` dari JOIN ke periods WHERE status='active'
3. Update `src/api/groups.ts` `getMyGroups()` return type untuk include `member_count` dan `current_period`
