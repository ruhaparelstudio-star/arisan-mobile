# GAP — Swap Screens Tidak Refresh Saat Difokus Kembali

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Code audit final 2026-06-03  
**File:** `src/screens/swaps/SwapInboxScreen.tsx`, `src/screens/swaps/SwapApprovalScreen.tsx`, `src/screens/swaps/SwapStatusScreen.tsx`

## Masalah

Ketiga screen swap hanya menggunakan `useEffect` (mount-only) untuk fetch data. Jika user:
1. Membuka SwapInboxScreen → ada swap pending
2. Navigasi ke screen lain (misal, ke DetailGrupScreen)
3. Menerima notifikasi swap baru
4. Kembali ke SwapInboxScreen

→ List swap **tidak diperbarui** karena screen tidak mount ulang (React Navigation reuses component).

### Dampak per Screen

| Screen | Kasus | Dampak |
|--------|-------|--------|
| `SwapInboxScreen` | Target swap baru masuk saat screen dibuka | Tidak terlihat sampai pull-to-refresh |
| `SwapApprovalScreen` | Swap target_accepted saat ketua buka screen | Tidak terlihat tanpa refresh |
| `SwapStatusScreen` | Target/ketua respons saat requester cek status | Status tidak update tanpa refresh |

## Fix yang Diterapkan

Ganti `useEffect(() => { load(); }, [load])` dengan `useFocusEffect(useCallback(() => { load(); }, [load]))` di ketiga screen.

**SwapStatusScreen** adalah yang paling penting — ini adalah screen yang user pantau aktif-aktif menunggu respons swap dari target/ketua.

## Trade-off

- Tambahan 1 API call setiap kali kembali ke screen
- Acceptable karena swap data kecil (hanya list swap user) dan perubahan status adalah core feature
