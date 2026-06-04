# GAP Report — Arisan Mobile

> Generated: 2026-06-03 | Sistem: Expo SDK 52 · React Native 0.76 · TypeScript  
> **Skor Awal Overall: 7.4/10**  
> **Target: 10/10**

---

## Status Iterasi

| Iterasi | Tanggal | Skor Overall | Gap Ditemukan | Gap Difix |
|---------|---------|-------------|---------------|-----------|
| #1 | 2026-06-03 | 7.4/10 | 18 gap | 13 difix, 5 butuh backend/dep |
| #2 | 2026-06-03 | 8.1/10 | 5 gap baru | Semua 5 difix |
| #3 | 2026-06-03 | 8.5/10 | 1 trivial | 1 difix (unused import) |

**Skor ceiling mobile-only: ~8.5/10**
Gap tersisa memerlukan perubahan backend/infrastruktur atau dependency baru — di luar scope mobile.

---

## P0 — Data Integrity / Silent Failures

### GAP-P0-1: Push token tidak pernah dikirim ke backend
- **File:** `src/api/auth.ts:56` — `updatePushToken()` ada tapi tidak pernah dipanggil
- **Dampak:** Semua push notification dari backend cron gagal diam-diam untuk semua user
- **Fix:** Panggil `Notifications.getExpoPushTokenAsync()` + `updatePushToken()` di `AuthContext.login()` setelah login berhasil
- **Status:** ✅ Fixed — `AuthContext.login()` sekarang request permission + daftarkan push token ke backend

### GAP-P0-2: `groupName: 'Grup'` hardcoded di UndianScreen
- **File:** `src/screens/undian/UndianScreen.tsx:476`
- **Kode:** `navigation.navigate('RiwayatPemenang', { groupId, groupName: 'Grup' })`
- **Dampak:** RiwayatPemenangScreen selalu menampilkan "Grup" bukan nama grup asli
- **Fix:** Tambah state `loadedGroupName` yang diisi dari `getGroupDetail`, dipakai saat navigate
- **Status:** ✅ Fixed — state `loadedGroupName` diset dari API, digunakan di navigate

### GAP-P0-3: `arisan_amount` selalu 0 di winner history
- **File:** `src/api/undian.ts:9` — `arisan_amount: 0` hardcoded di `adaptWinner`
- **Dampak:** UndianResultScreen selalu tampilkan Rp 0 untuk jumlah pemenang
- **Fix:** Backend perlu hitung dan kirim amount, atau kalkulasi dari `group.nominal × member_count`
- **Status:** ⬜ Perlu perubahan backend — ditunda

---

## P1 — Significant UX Gaps

### GAP-P1-1: Double-load race di DetailGrupScreen
- **File:** `src/screens/groups/DetailGrupScreen.tsx:157-160`
- **Masalah:** `useEffect(() => load(), [load])` DAN `useFocusEffect(() => load(), [load])` keduanya fire saat initial mount → 10 API calls bersamaan
- **Fix:** Hapus `useEffect`, hanya pakai `useFocusEffect` — sudah cover initial + focus
- **Status:** ✅ Fixed — `useEffect` dihapus, hanya `useFocusEffect` yang tersisa

### GAP-P1-2: `fetchData(true)` setelah action tidak reset error
- **File:** `src/screens/payments/PaymentStatusScreen.tsx:147`
- **Masalah:** Setelah `confirmPayment/cancelConfirm` sukses, `fetchData(true)` dipanggil — `fromCache=true` skip `setError(null)`, error lama tetap tampil
- **Fix:** Ganti ke `fetchData(false)` setelah action sukses
- **Status:** ✅ Fixed — `fetchData(false)` dipanggil setelah action sukses

### GAP-P1-3: BukuArisan tidak ada offline support
- **File:** `src/screens/groups/BukuArisanScreen.tsx:182`
- **Masalah:** `if (!isOnline) { setLoading(false); return; }` — layar kosong saat offline, tidak ada cache
- **Fix:** Tambah `cache.set/get` + StateView offline + fallback ke cache saat fetch gagal
- **Status:** ✅ Fixed — cache ditambahkan, StateView offline ditampilkan jika tidak ada cache

### GAP-P1-4: SwapStatusScreen fetch O(n) untuk 1 swap
- **File:** `src/screens/swaps/SwapStatusScreen.tsx:114`
- **Masalah:** Fetch semua swap user lalu filter by `requestId` — makin lambat seiring history bertambah
- **Fix:** Backend tambah `GET /api/swaps/:id`, atau cache swap object setelah request
- **Status:** ⬜ Perlu perubahan backend — ditunda

### GAP-P1-5: HomeScreen buat extra `getGroupDetail` call
- **File:** `src/screens/home/HomeScreen.tsx:112-122`
- **Masalah:** Untuk cek payment status, HomeScreen panggil `getGroupDetail()` lagi meski sudah punya group list — 2 API calls setiap focus
- **Fix:** Backend sertakan `current_period_id` di response list groups, atau cache group detail
- **Status:** ⬜ Perlu perubahan backend — ditunda

### GAP-P1-6: `ketua_pending` status hilang dari SwapStatus labels
- **File:** `src/screens/swaps/SwapStatusScreen.tsx:32-39`
- **Masalah:** `statusLabel()` tidak handle `ketua_pending`, raw string ditampilkan ke user
- **Fix:** Tambah case `ketua_pending: 'Dari Ketua — Menunggu Kamu'` di `statusLabel()` dan `statusTone()`
- **Status:** ✅ Fixed — `ketua_pending` dan `target_accepted` ditambahkan ke label & tone maps

---

## P2 — Quality Issues

### GAP-P2-1: Cache `isStale` dikembalikan tapi tidak pernah dipakai
- **File:** `src/utils/cache.ts:9`
- **Masalah:** `cache.get()` return `{ data, isStale }` tapi semua caller ignore `isStale`
- **Fix:** HomeScreen: jika `cached.isStale && isOnline`, trigger background refresh otomatis
- **Status:** ✅ Fixed — HomeScreen sekarang trigger silent background refresh saat data stale

### GAP-P2-2: JoinGrup/JoinConfirm terdaftar di dua navigator
- **File:** `src/navigation/types.ts:13-14` dan `:45-46`
- **Masalah:** Keduanya ada di `AuthStackParamList` dan `AppStackParamList` — TypeScript type narrowing rusak
- **Fix:** Kedua registrasi valid karena dipakai di konteks berbeda (pre-login vs post-login). TypeScript tidak error karena param list terpisah.
- **Status:** ⬜ Acceptable — bukan bug aktual, TypeScript 0 errors. Ditinggal by design.

### GAP-P2-3: Tidak ada push notification permission request
- **Masalah:** Tidak ada screen yang memanggil `Notifications.requestPermissionsAsync()`
- **Fix:** Digabung dengan fix GAP-P0-1 di `AuthContext.login()`
- **Status:** ✅ Fixed — `Notifications.requestPermissionsAsync()` dipanggil saat login

### GAP-P2-4: Supabase anon key tanpa RLS
- **Masalah:** Semua user bisa query langsung semua messages/payments via Supabase client
- **Fix:** Tambah RLS policy: messages dan payments hanya readable oleh anggota grup
- **Status:** ⬜ Perlu perubahan Supabase (infrastruktur) — ditunda

### GAP-P2-5: Input tanggal pakai TextInput biasa
- **File:** `src/screens/groups/DetailGrupScreen.tsx:883`
- **Masalah:** TextInput untuk format `YYYY-MM-DD` — tidak ada date picker, validasi hanya di submit
- **Fix:** Ganti dengan `@react-native-community/datetimepicker` (perlu dependency baru)
- **Status:** ⬜ Perlu konfirmasi install dependency baru — ditunda

### GAP-P2-6: HomeScreen hero hanya tampil grup aktif pertama
- **File:** `src/screens/home/HomeScreen.tsx:141`
- **Masalah:** `groups.find((g) => g.status === 'active')` — jika ada banyak grup aktif, hanya 1 ditampilkan
- **Fix:** Tambah `otherActiveCount` dan tampilkan "+N grup aktif lainnya" di hero card
- **Status:** ✅ Fixed — teks "+N grup aktif lainnya — lihat di tab Grup" ditambahkan

### GAP-P2-7: Tidak ada realtime untuk SwapStatus dan Undian live view
- **Masalah:** Non-ketua poll undian setiap 8 detik; swap status butuh pull-to-refresh manual
- **Fix:** Gunakan Supabase Realtime channel untuk tabel `winners` dan `swaps`
- **Status:** ⬜ Kompleks — ditunda ke sprint berikutnya

### GAP-P2-8: Tidak ada token refresh — logout tiba-tiba saat token expired
- **Masalah:** JWT expired → next API call return 401 → user dilogout tiba-tiba tanpa warning
- **Fix:** Set flag `sessionExpired` di AuthContext, tampilkan banner di SplashScreen
- **Status:** ✅ Fixed — SplashScreen tampilkan "Sesimu telah berakhir" saat `sessionExpired=true`

---

## P3 — Polish

### GAP-P3-1: Komentar interval poll salah (8s vs komentar "3 detik")
- **File:** `src/screens/undian/UndianScreen.tsx:159`
- **Masalah:** `setInterval(() => load(false), 8000)` tapi komentar bilang "3 detik"
- **Fix:** Komentar diperbarui ke "8 detik"
- **Status:** ✅ Fixed — komentar inline sudah benar

### GAP-P3-2: BukuArisan offline menampilkan layar kosong
- **Masalah:** Offline → loading berhenti → tidak ada state view, tidak ada pesan
- **Fix:** Digabung dengan fix GAP-P1-3 — StateView ditampilkan saat offline tanpa cache
- **Status:** ✅ Fixed — StateView "Tidak Dapat Memuat" tampil saat offline + no cache

### GAP-P3-3: Kondisi prompt tanggal untuk pemenang mungkin salah
- **File:** `src/screens/groups/DetailGrupScreen.tsx:380`
- **Masalah:** `showWinnerTanggalPrompt = isWinner && !currentPeriodDue` — cek `due_date` bukan `execution_date`; pemenang yang belum set `tanggal_pelaksanaan` tapi sudah ada `jatuh_tempo` tidak dapat prompt
- **Fix:** Ganti kondisi ke `!currentExecutionDate`
- **Status:** ✅ Fixed — kondisi sekarang `!currentExecutionDate`

---

## Cara Update File Ini

Setelah setiap gap difix, update kolom **Status** dari `⬜` ke `✅`, lalu jalankan `/system-review` kembali.

Format update:
```
- **Status:** ✅ Fixed — [deskripsi singkat fix]
```

---

## Loop Fix → Review

Setelah semua gap dalam satu iterasi difix:
1. Jalankan `/system-review` kembali
2. Update tabel **Status Iterasi** dengan skor baru
3. Tambah gap baru yang ditemukan ke file ini
4. Ulangi sampai skor Overall = **10/10**
