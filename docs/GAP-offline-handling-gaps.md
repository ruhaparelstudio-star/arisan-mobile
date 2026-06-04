# GAP — Offline Handling Tidak Lengkap di Beberapa Screen

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Code audit 2026-06-03  
**File:** `src/screens/groups/GroupsScreen.tsx`, `src/screens/auth/OTPVerifyScreen.tsx`

## Masalah

### 1. GroupsScreen Tidak Check `isOnline` Sebelum API Call

`GroupsScreen.load()` langsung memanggil `getMyGroups(token)` tanpa memeriksa status jaringan. Jika offline:
1. API call dibuat → tunggu 15 detik timeout
2. Setelah timeout → fallback ke cache

**Dampak:** User menunggu 15 detik blank screen sebelum data tersebut dari cache.

**Fix:** Tambah `useNetworkStatus` dan check offline di awal `load()`. Jika offline, langsung baca dari cache tanpa API call.

### 2. OTPVerifyScreen WA Support Link ke Nomor Palsu

`SUPPORT_WA_NUM` fallback ke `'6281234567890'` jika `EXPO_PUBLIC_SUPPORT_WA` tidak diset. Nomor ini tidak valid — user yang tap "Hubungi dukungan via WhatsApp →" akan dibawa ke nomor yang tidak ada.

**Fix:**
- Fallback ke string kosong
- Kondisional: jika `SUPPORT_WA` kosong, tampilkan pesan statis "Hubungi admin arisan kamu" alih-alih link WA

## Screen yang Tidak Perlu OfflineBanner (Per CLAUDE.md)

Per `CLAUDE.md`, OfflineBanner wajib hanya di:
- ✅ HomeScreen
- ✅ DetailGrupScreen  
- ✅ PaymentStatusScreen
- ✅ ChatScreen

GroupsScreen, NotificationsScreen, ProfileScreen tidak wajib OfflineBanner. Tapi GroupsScreen tetap harus handle offline gracefully (tidak timeout).
