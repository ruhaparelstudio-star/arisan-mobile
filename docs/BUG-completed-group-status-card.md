# BUG — DetailGrupScreen Status Card Salah untuk Grup Completed

**Severity:** Medium  
**Status:** Diperbaiki  
**Ditemukan:** Device testing 2026-06-03  
**File:** `src/screens/groups/DetailGrupScreen.tsx`

## Masalah

Untuk grup dengan `status='completed'`:
- Status card menampilkan "PERIODE 1 DARI 2" (karena `current_period ?? 1`)
- Status card menampilkan "Belum ada pemenang" meskipun undian sudah dilakukan
- Root cause: backend mengembalikan `current_period=null` dan `current_period_id=null` untuk grup completed

```typescript
// Sebelumnya (bug):
<Text>PERIODE {group?.current_period ?? 1} DARI {group?.total_periods ?? 12}</Text>
// current_period=null → fallback ke 1 → menampilkan "PERIODE 1 DARI 2"

// Winner query:
undianRes.winners.find(w => w.period_number === null) → undefined → "Belum ada pemenang"
```

## Fix yang Diterapkan

Status card sekarang mengecek `group?.status === 'completed'`:
- Jika completed → tampil "ARISAN SELESAI · N PERIODE"
- Jika ada winner → tampil "Terakhir menang: [nama]" atau "N pemenang tersimpan"
- Jika tidak completed → behavior normal seperti sebelumnya

## Cara Reproduksi

1. Selesaikan semua periode arisan (close period terakhir)
2. Buka DetailGrupScreen grup tersebut
3. Status card sebelumnya: "PERIODE 1 DARI 2" + "Belum ada pemenang" ❌
4. Status card sesudah fix: "ARISAN SELESAI · 2 PERIODE" + winner info ✅
