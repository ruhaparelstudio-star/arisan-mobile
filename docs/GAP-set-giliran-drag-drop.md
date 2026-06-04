# GAP — SetGiliranScreen: Masih Pakai ↑↓ Button (PRD F02)

**Severity:** Medium  
**Status:** Diperbaiki di kode  
**File:** `src/screens/groups/SetGiliranScreen.tsx`

## Masalah

PRD F02 mensyaratkan drag & drop untuk Set Giliran anggota.  
Implementasi saat ini menggunakan tombol ↑↓ yang kurang intuitif.

**Library sudah tersedia:** `react-native-draggable-flatlist` sudah terinstall dan sudah dipakai di `UndianScreen.tsx` (Mode 3 manual ordering). Tidak ada dependency baru yang diperlukan.

## Solusi

Migrasi `SetGiliranScreen` dari ↑↓ buttons ke `DraggableFlatList`.

### Perubahan UI:
- List member menjadi draggable dengan drag handle icon
- Hapus tombol ↑ dan ↓
- Tambah instruksi "Tekan dan tahan untuk menggeser urutan"
- Simpan urutan tetap via tombol "Simpan Urutan" di bawah

### Keuntungan:
- Konsisten dengan UndianScreen Mode 3 (pola yang sama)
- UX lebih intuitif untuk mobile
- Kode lebih simpel (hapus logika moveUp/moveDown)

## Kode yang Diubah

### `src/screens/groups/SetGiliranScreen.tsx`
- Replace `FlatList` dengan `DraggableFlatList`
- Hapus fungsi `moveUp()` dan `moveDown()`
- Tambah drag handle icon di setiap row
- Wrap dengan `GestureHandlerRootView` (sudah ada di App.tsx)
