# GAP — ProfileScreen: Menu Items Stub (Segera Hadir)

**Severity:** Medium  
**Status:** Diperbaiki di kode  
**File:** `src/screens/home/ProfileScreen.tsx`

## Masalah

5 menu items di ProfileScreen hanya memanggil `comingSoon()` (Alert.alert):
- Rekening bank
- Pengaturan notifikasi  
- Keamanan & PIN
- Riwayat semua arisan
- Bantuan & dukungan

Untuk app production, ini terlihat tidak selesai dan menurunkan kepercayaan user.

## Solusi

Menu items yang belum punya implementasi backend **dihapus dari list** untuk launch.

**Alasan tidak pakai halaman "Segera Hadir":**
- Menambah navigasi yang berakhir di dead-end
- User tetap frustrasi, hanya presentasinya berbeda
- Lebih bersih dan jujur jika tidak ada sama sekali

**Yang dipertahankan:**
- Edit nama ✅
- Kebijakan Privasi ✅ (buka URL)
- Bantuan & Dukungan → diganti tombol buka WA support langsung (lebih actionable)
- Logout ✅
- Hapus Akun ✅

## Kode yang Diubah

### `src/screens/home/ProfileScreen.tsx`
- Hapus entries: Rekening bank, Pengaturan notifikasi, Keamanan & PIN, Riwayat semua arisan
- Ganti "Bantuan & dukungan" dengan buka `EXPO_PUBLIC_SUPPORT_WA` via `Linking.openURL`
- Hapus fungsi `comingSoon()` yang tidak lagi dipakai
