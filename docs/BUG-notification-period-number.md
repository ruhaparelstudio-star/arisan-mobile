# BUG — Push Notification periodNumber Hardcoded 0

**Severity:** Low  
**Status:** Diperbaiki di kode  
**File:** `src/navigation/RootNavigator.tsx`

## Masalah

Saat user tap push notification tipe `payment_confirmed` atau `payment_late`, navigasi ke `PaymentStatusScreen` dengan:

```typescript
navRef.navigate('Bayar', { groupId, periodId, periodNumber: 0 });
```

`periodNumber: 0` adalah hardcoded. `PaymentStatusScreen` menampilkan "Periode 0" di title.

## Root Cause

Data `period_number` tidak diinclude di payload push notification dari backend. Payload hanya berisi `group_id` dan `period_id`.

## Solusi

Dua opsi:

**Opsi A (Backend):** Backend tambahkan `period_number` ke notification payload.

**Opsi B (Mobile, yang diimplementasikan):** Navigasi ke `GroupDetail` dulu, biarkan user masuk ke `Bayar` dari sana yang sudah punya `period_number` dari `getPeriods()`. Ini lebih robust karena tidak bergantung pada data di notification payload.

### Flow baru:
```
Tap notif payment → GroupDetail screen
  → User tap "Status Bayar" → PaymentStatusScreen dengan period_number yang benar
```

## Trade-off
- Sedikit lebih banyak tap untuk user
- Tapi tidak pernah menampilkan "Periode 0" yang salah
- Consistent dengan deep link `undian_done` yang sudah navigate ke GroupDetail via `RiwayatPemenang`

## Kode yang Diubah

### `src/navigation/RootNavigator.tsx`
```typescript
case 'payment_confirmed':
case 'payment_late':
  if (groupId)
    navRef.navigate('GroupDetail', { groupId, groupName: '' });
  break;
```
