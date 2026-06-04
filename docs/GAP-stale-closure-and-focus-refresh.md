# GAP — Stale Closure & Missing Focus Refresh

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Code audit final 2026-06-03  
**File:** `src/screens/groups/GroupsScreen.tsx`, `src/screens/payments/PaymentHistoryScreen.tsx`, `src/screens/home/NotificationsScreen.tsx`

## Masalah

### 1. GroupsScreen: `isOnline` Stale Closure

`load` callback di `GroupsScreen` menggunakan `isOnline` di dalam fungsinya, tapi dependency array hanya `[token]`:

```typescript
const load = useCallback(async (isRefresh = false) => {
  if (!isOnline) { ... }  // isOnline dipakai
  ...
}, [token]);  // ← isOnline tidak ada!
```

**Dampak:** Jika user beralih dari offline ke online, `load` masih merujuk `isOnline = false` dari closure lama. Akibatnya, saat online setelah sebelumnya offline, `useFocusEffect` tetap membaca dari cache alih-alih fetch API.

**Fix:** Tambah `isOnline` ke dependency array: `[token, isOnline]`.

### 2. PaymentHistoryScreen: Tidak Ada `isOnline` Check

`fetchPeriods()` langsung memanggil `getPeriods(token, groupId)` tanpa cek offline. Jika offline, user menunggu 15 detik timeout sebelum melihat error.

**Fix:** Tambah `useNetworkStatus` + early return dengan pesan error deskriptif jika offline. Tambah `isOnline` ke dependency array.

### 3. NotificationsScreen: Tidak Ada `useFocusEffect`

`NotificationsScreen` hanya load notifikasi saat mount (`useEffect`). Jika user membuka notifikasi dari push notification tap, lalu navigate ke screen lain dan kembali, list notifikasi tidak direfresh.

**Fix:** Ganti `useEffect` dengan `useFocusEffect` — refresh saat screen difokus.
