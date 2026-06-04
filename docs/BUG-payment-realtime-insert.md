# BUG — Payment Realtime INSERT Tidak Menambah Member Baru

**Severity:** Medium  
**Status:** Diperbaiki di kode  
**File:** `src/hooks/usePaymentRealtime.ts`

## Masalah

Di `usePaymentRealtime.ts`, saat Supabase Realtime menerima event INSERT (payment baru dibuat):

```typescript
const idx = prev.findIndex((p) => p.user_id === raw.user_id);
if (idx >= 0) {
  // update existing
} 
return prev; // ← INSERT untuk user baru di-skip!
```

Jika `PaymentStatusScreen` diload sebelum semua anggota punya record payment (mis. grup baru), anggota yang membayar belakangan tidak akan muncul di list sampai pull-to-refresh manual.

**Catatan:** `PaymentStatusScreen` sudah membangun `fullPayments` dari `groupData.members` sebagai fallback (fix dari sesi sebelumnya), jadi initial render benar. Tapi update realtime untuk INSERT tetap tidak bekerja.

## Solusi

Saat realtime INSERT dan `user_id` belum ada di `prev`, tambahkan record baru ke state.  
User field (`name`, `phone`) tidak tersedia di realtime payload — fallback ke data dari `memberMap` yang sudah diload saat fetchData.

### Pendekatan:
Karena `usePaymentRealtime` tidak punya akses ke `memberMap`, solusi paling bersih adalah:
1. Saat INSERT dan `idx < 0`: tambah payment baru ke state dengan `user: { name: null, phone: raw.user_id }` sebagai placeholder
2. UI akan menampilkan nama "Anggota" sampai pull-to-refresh yang mengisi nama lengkap

## Kode yang Diubah

### `src/hooks/usePaymentRealtime.ts`
```typescript
if (idx >= 0) {
  const next = [...prev];
  next[idx] = { ...raw, user: prev[idx].user };
  return next;
}
// INSERT: tambah payment baru dengan fallback user
return [...prev, { ...raw, user: { name: null, phone: raw.user_id } }];
```
