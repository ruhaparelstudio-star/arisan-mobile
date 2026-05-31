# MO-7 — Offline Mode

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-6 selesai.
> Scope: enhancement offline di SEMUA screen yang sudah ada.
> Jangan buat screen baru — hanya tambah offline handling ke yang sudah ada.
> ```

---

## Implementasi per Screen

### HomeScreen
- Load dari `CACHE_KEYS.GROUPS_LIST` jika offline
- Tampilkan label stale: `"Data terakhir diperbarui: [waktu]"`
- Setelah fetch sukses: update cache

### DetailGrupScreen
- Load dari `CACHE_KEYS.groupDetail(id)` jika offline
- Tombol "Buat Grup", "Gabung Grup", "Bubarkan", "Keluar" → disabled + tooltip

### PaymentStatusScreen
- Load dari `CACHE_KEYS.payments(periodId)` jika offline
- Tombol konfirmasi → disabled + tooltip "Butuh koneksi internet"

### Semua Screen
- OfflineBanner muncul saat offline
- Setelah kembali online: auto-refresh data + banner hilang (animasi slide up)

---

## Skeleton Loading

Ganti semua `null` atau blank loading state dengan `SkeletonPlaceholder`:
```typescript
// Saat isLoading: tampilkan placeholder abu-abu animasi pulse
// Library: react-native-skeleton-placeholder (konfirmasi dulu)
// Atau: buat sendiri dengan Animated.loop + Animated.sequence
```

---

## Checklist

```
[ ] Cache ter-update setiap kali data berhasil di-fetch?
[ ] Label "terakhir diperbarui" muncul saat offline?
[ ] Auto-refresh saat kembali online?
[ ] Semua aksi kritis disabled saat offline?
[ ] Tooltip muncul saat tap aksi yang disabled?
[ ] Skeleton loading (bukan blank) untuk semua screen?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): offline mode — cache, banner, disabled actions, skeleton"
Update MO-7.
```

**Sesi berikutnya:** `MO-8-beta.md`

---
---

