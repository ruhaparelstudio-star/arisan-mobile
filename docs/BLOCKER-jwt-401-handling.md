# BLOCKER — JWT Token 401 Tidak Trigger Logout di Mid-Session

**Severity:** Kritis  
**Status:** Diperbaiki di kode  
**File:** `src/api/client.ts`, `src/context/AuthContext.tsx`

## Masalah

Token divalidasi hanya saat app launch. Jika token expire di tengah sesi:
1. Semua API call berikutnya mendapat 401
2. UI menampilkan error "Request gagal" per-screen
3. User tidak tahu harus login ulang — tidak ada redirect otomatis

## Solusi yang Diimplementasikan

### Mekanisme Event Bus

`client.ts` memancarkan event `SESSION_EXPIRED` via `EventEmitter` saat menerima 401/403.  
`AuthContext` subscribe ke event ini dan set `sessionExpired = true`.  
`RootNavigator` sudah menangani `sessionExpired` → redirect ke `AuthNavigator`.

### Flow:
```
API call → 401 response
  → client.ts emit SESSION_EXPIRED event
    → AuthContext.sessionExpired = true
      → RootNavigator render AuthNavigator (login screen)
```

## Kode yang Diubah

### `src/api/client.ts`
- Tambah `import { EventEmitter }` 
- Tambah `export const authEvents = new EventEmitter()`
- Setelah response 401/403: `authEvents.emit('SESSION_EXPIRED')`

### `src/context/AuthContext.tsx`
- Subscribe ke `authEvents.SESSION_EXPIRED` di useEffect
- Saat event diterima: clear storage + set `sessionExpired = true`

## Catatan
- Event hanya di-emit untuk status 401 dan 403 (bukan 400 atau 500)
- Tidak mempengaruhi flow offline (status 0 tetap dipertahankan sesi)
- `sessionExpired = true` di RootNavigator memicu render AuthNavigator
