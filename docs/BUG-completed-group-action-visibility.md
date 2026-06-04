# BUG — Aksi UI Salah untuk Grup Completed/Disbanded

**Severity:** Medium  
**Status:** Diperbaiki  
**Ditemukan:** 2026-06-03 (device testing + code audit)  
**File:** `src/screens/groups/DetailGrupScreen.tsx`

## Masalah yang Ditemukan

Setelah arisan selesai (`status='completed'`), beberapa aksi UI masih bisa diakses padahal tidak relevan:

### 1. Quick Actions — Tukar Button Masih Enabled
- **Bug:** `tukarEnabled = hasAnyWinner` — setelah arisan selesai ada pemenang, sehingga Tukar **enabled**
- **Dampak:** User bisa navigate ke RequestSwap/SwapInbox untuk grup yang sudah selesai
- **Fix:** Tambah kondisi `groupInactive` — jika `completed` atau `disbanded`, semua kecuali Chat = disabled

### 2. Quick Actions — Bayar Menampilkan Green Faded
- **Bug:** `quickBtnDisabled` hanya `opacity: 0.4`, tidak mengubah warna background
- **Dampak:** Bayar button masih terlihat hijau (faded) meski disabled — UX membingungkan
- **Fix:** Bayar sekarang disabled secara eksplisit via `groupInactive` kondisi baru, konsisten dengan Tukar/Undian

### 3. Label "Lunas ✓" Tampil untuk Completed Group
- **Bug:** Label `isBayar && alreadyPaid ? 'Lunas ✓' : a.label` tidak mengecek `groupInactive`
- **Fix:** Label kembali ke "Bayar" untuk completed group — "Lunas ✓" tidak relevan konteksnya

### 4. Winner Tanggal Prompt Bisa Muncul untuk Completed
- **Bug:** `showWinnerTanggalPrompt = isWinner && !currentExecutionDate && ...` — untuk completed group, kondisi ini bisa `true` jika winner tidak punya execution_date
- **Fix:** Tambah `&& group?.status === 'active'`

### 5. "Keluar Grup" Tampil untuk Active/Completed/Disbanded
- **Bug:** Tombol "Keluar Grup" muncul untuk semua status non-ketua
- **Catatan:** Backend menolak leave untuk active group. Untuk completed, tidak ada gunanya keluar
- **Fix:** Hanya tampil saat `status === 'recruiting'`

## State Machine Aksi per Status

| Aksi | recruiting | active | completed | disbanded |
|------|-----------|--------|-----------|-----------|
| Bayar | ❌ (no period) | ✅ | ❌ (inactive) | ❌ (inactive) |
| Chat | ✅ | ✅ | ✅ | ✅ |
| Tukar | ❌ (no winner) | ✅ | ❌ (inactive) | ❌ (inactive) |
| Undian | ❌ (no period) | ✅ | ❌ (inactive) | ❌ (inactive) |
| Kelola Grup (card) | ✅ | ✅ | ❌ | ❌ |
| Keluar Grup (anggota) | ✅ | ❌ | ❌ | ❌ |
| Winner Tanggal Prompt | ❌ | ✅ | ❌ | ❌ |
