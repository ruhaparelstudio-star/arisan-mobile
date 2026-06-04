# BUG — Tombol Ketua Masih Aktif untuk Grup Completed

**Severity:** Medium  
**Status:** Diperbaiki  
**Ditemukan:** 2026-06-03  
**File:** `src/screens/groups/DetailGrupScreen.tsx`

## Masalah

Setelah arisan selesai (`status='completed'`), ketua masih bisa melihat dan menekan:
- **"Bubarkan Grup"** — backend menolak (hanya bisa saat recruiting), tapi UI tetap tampil dan membingungkan
- **"Set Giliran"** — navigasi ke SetGiliranScreen (dalam mode locked), tapi tidak ada gunanya untuk arisan yang sudah selesai
- **"Kode Invite"**, **"Approval Tukar Giliran"** — tidak relevan untuk completed group

## Fix yang Diterapkan

Seluruh card **"Kelola Grup"** disembunyikan saat `status='completed'`:
```tsx
{isKetua && group?.status !== 'completed' && (
  <Card style={styles.ketuaCard}>...</Card>
)}
```

Di dalam card, visibilitas per aksi juga diperketat:

| Aksi | Sebelumnya | Sesudah |
|------|-----------|---------|
| Set Giliran | Selalu tampil (tapi locked) | Hanya `recruiting` |
| Kode Invite | Selalu tampil | Hanya `recruiting` |
| Atur Tanggal | Hanya `active` ✅ | Tidak berubah |
| Tukar Giliran (Ketua) | Hanya `random` + `hasAnyWinner` | Tidak berubah |
| Approval Tukar | Selalu tampil | Hanya `active` |
| Tutup Periode | Hanya `active` + undian done ✅ | Tidak berubah |
| Mulai Arisan | Hanya `recruiting` ✅ | Tidak berubah |
| **Bubarkan Grup** | **Selalu tampil** ❌ | **Hanya `recruiting`** ✅ |

## State Machine Ketua Actions

```
recruiting → Set Giliran ✅  Kode Invite ✅  Mulai Arisan ✅  Bubarkan ✅
active     → Atur Tanggal ✅  Tukar Giliran ✅  Approval Tukar ✅  Tutup Periode ✅
completed  → (card Kelola Grup tersembunyi sepenuhnya)
disbanded  → (card Kelola Grup tersembunyi sepenuhnya)
```
