# GAP — arisan_amount Selalu 0 di Riwayat Pemenang

**Severity:** Low  
**Status:** Butuh perubahan backend  
**File:** `src/api/undian.ts`, `src/screens/undian/RiwayatPemenangScreen.tsx`

## Masalah

Field `arisan_amount` di tabel `winners` tidak ada di DB — selalu 0.

```typescript
arisan_amount: raw.arisan_amount ?? 0,  // tidak ada di DB, selalu 0
```

`RiwayatPemenangScreen` sudah guard dengan `{w.arisan_amount > 0 && ...}` sehingga tidak crash, tapi angka jumlah yang diterima pemenang tidak pernah ditampilkan.

## Dampak

Transparansi finansial berkurang. User tidak bisa melihat berapa total yang mereka terima saat menang undian.

## Solusi

### Backend
Saat `GET /api/groups/:id/winners`, hitung `arisan_amount`:
```
arisan_amount = group.nominal × member_count
```

Ini bukan data yang perlu disimpan di DB — bisa dihitung on-the-fly saat query.

### Catatan
- Nilai ini adalah nominal ideal (asumsi semua bayar)
- Untuk nilai aktual (minus yang tidak bayar), perlu join ke payments tabel
- Untuk MVP, nominal ideal sudah cukup

### Mobile (sudah difix — kalkulasi lokal)
`RiwayatPemenangScreen` sekarang fetch `getGroupDetail()` secara paralel dengan `getHistory()`.  
Jika `w.arisan_amount === 0` (backend belum kirim), Pill nominal dihitung lokal:

```
arisan_amount_lokal = group.nominal × group.members.length
```

Nilai ini ditampilkan untuk semua entri winner. Ketika backend akhirnya mengirim `arisan_amount > 0`, nilai backend dipakai (lebih akurat, memperhitungkan anggota yang keluar).

**Status:** Nilai sudah tampil di UI tanpa perlu perubahan backend.
