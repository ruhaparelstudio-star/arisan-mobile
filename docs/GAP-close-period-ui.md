# GAP — closePeriod Tidak Ada UI (Undian Mode 2 Bisa Terblokir)

**Severity:** Medium  
**Status:** Diperbaiki di kode  
**File:** `src/screens/groups/DetailGrupScreen.tsx`

## Masalah

`closePeriod()` sudah ada di `src/api/groups.ts` tapi tidak ada tombol/screen yang memanggilnya.

**Dampak langsung:** Di undian Mode 2 (random), `prevPeriodClosed` digunakan untuk menentukan apakah undian periode berikutnya bisa dilakukan. Jika ketua tidak pernah menutup periode, `prevPeriodClosed = false` dan undian terblokir selamanya dengan hint kuning "Periode sebelumnya belum ditutup".

**Pertanyaan kunci:** Apakah backend menutup periode otomatis?  
Berdasarkan kode backend (dari catatan MO-13), periode TIDAK ditutup otomatis — harus dipanggil manual via `POST /api/groups/:id/periods/:periodId/close`.

## Solusi

Tambah tombol "Tutup Periode" di **Ketua Actions** pada DetailGrupScreen.

### Kapan tombol muncul:
- `isKetua === true`
- `group.status === 'active'`
- Period aktif ada (`current_period_id !== null`)
- Undian sudah dilakukan untuk periode ini (`currentPeriodUndianDone === true`)

### Flow:
1. Ketua tap "Tutup Periode"
2. Alert konfirmasi: "Tutup periode [N]? Ini akan memajukan arisan ke periode berikutnya."
3. Konfirmasi → call `closePeriod()` → reload group detail

### Informasi yang ditampilkan di Alert:
- `closed_period`: periode yang ditutup
- `next_period`: periode selanjutnya
- `unpaid_count`: berapa anggota belum bayar (jika ada, tampilkan warning)

## Kode yang Diubah

### `src/screens/groups/DetailGrupScreen.tsx`
- Tambah `handleClosePeriod()` async function
- Tambah tombol "Tutup Periode" di section Ketua Actions
- Kondisi tampil: `isKetua && currentPeriodUndianDone && group?.status === 'active'`
