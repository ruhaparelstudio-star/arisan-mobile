# BUG — Badge Notifikasi Tab Bar Tidak Update Langsung Setelah Dibaca

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Code audit 2026-06-03  
**File:** `src/hooks/useUnreadCount.ts`, `src/navigation/AppNavigator.tsx`, `src/screens/home/NotificationsScreen.tsx`

## Masalah

Badge merah di tab Notifikasi (AppNavigator) menggunakan `useUnreadCount` instance tersendiri yang poll setiap 30 detik. Ketika user menekan "Tandai dibaca" atau "Tandai semua dibaca" di NotificationsScreen, badge tidak langsung hilang — harus tunggu polling berikutnya (maksimum 30 detik).

## Root Cause

`useUnreadCount` adalah hook biasa (bukan context) — AppNavigator dan NotificationsScreen memiliki instance yang berbeda. Update state di NotificationsScreen tidak memengaruhi counter di AppNavigator.

## Fix yang Diterapkan

**Bridge pattern** (sama dengan `setSessionExpiredListener` di client.ts):

```typescript
// useUnreadCount.ts
let _globalRefresh: (() => void) | null = null;
export function registerUnreadRefresh(fn: () => void) { _globalRefresh = fn; }
export function triggerUnreadRefresh() { _globalRefresh?.(); }
```

1. **AppNavigator** meregistrasi `refresh` callback dari `useUnreadCount` via `registerUnreadRefresh`
2. **NotificationsScreen** memanggil `triggerUnreadRefresh()` setelah `markAllRead` atau `markRead`
3. Refresh langsung memperbarui counter di AppNavigator → badge hilang seketika

## Behavior Setelah Fix

- User tap "Tandai semua dibaca" → badge langsung hilang ✅
- User tap satu notifikasi → badge langsung berkurang 1 ✅
- 30s polling tetap aktif sebagai background sync ✅
