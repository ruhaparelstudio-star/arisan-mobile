# arisan-mobile — Progress Tracker (Mobile)

> Update setiap akhir sesi. Dibaca Claude Code di awal setiap sesi.
> Format: `[ ]` belum · `[~]` in progress · `[x]` selesai · `[!]` blocker

---

## Koordinasi dengan Backend

> Sebelum mulai sesi mobile, pastikan backend yang dibutuhkan sudah siap.
> Cek `../backend/PROGRESS.md` untuk status backend.

| Mobile Sesi | Butuh Backend |
|-------------|---------------|
| MO-0 Setup | BE-0 (health endpoint) |
| MO-1 Auth | BE-1 (OTP endpoints) |
| MO-2 Groups | BE-2 (groups endpoints) |
| MO-3 Payments | BE-3 (payments + realtime) |
| MO-4 Undian | BE-4 (undian endpoint) |
| MO-5 Swap | BE-5 (swap endpoints) |
| MO-6 Chat | BE-6 (Stream.io) |
| MO-7 Offline | BE-3 (untuk cache) |
| MO-8 Beta | BE-8 (production deploy) |

---

## Status Keseluruhan

| Sesi | Feature | Status |
|------|---------|--------|
| MO-0 | Setup Scaffold | `[x]` |
| MO-1 | Auth & Onboarding | `[x]` |
| MO-2 | Manajemen Grup | `[x]` |
| MO-3 | Tracking Pembayaran | `[ ]` |
| MO-4 | Sistem Undian | `[ ]` |
| MO-5 | Tukar Giliran | `[ ]` |
| MO-6 | Chat & Activity Log | `[ ]` |
| MO-7 | Offline Mode | `[ ]` |
| MO-8 | Beta Launch | `[ ]` |

---

## MO-0 — Setup Scaffold

```
[x] Expo project terinstall (manual setup, Expo SDK 52)
[x] Dependencies: expo-secure-store, expo-constants, expo-notifications, expo-font, expo-splash-screen
[x] React Navigation: @react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs
[x] Screens: react-native-screens, react-native-safe-area-context, react-native-svg
[x] src/api/client.ts — base fetch wrapper
[x] src/utils/storage.ts — SecureStore wrapper
[x] src/utils/cache.ts — AsyncStorage + TTL wrapper
[x] src/hooks/useNetworkStatus.ts — NetInfo hook
[x] src/components/OfflineBanner.tsx
[x] .env.example lengkap
[x] CLAUDE.md di root repo
[x] Navigation skeleton: RootNavigator + AuthNavigator + AppNavigator
[x] Verifikasi: npx expo run:android --device berhasil di device
[x] GitHub Actions: ci.yml
```

**Catatan:**
> Sesi MO-0 selesai 2026-05-30. Stack: Expo SDK 52, React Native 0.76.7, TypeScript 5.
> Expo SDK: ~52.0.0. Font: Space Grotesk + Plus Jakarta Sans via @expo-google-fonts.
> Semua screens dari Hi-Fi design diimplementasikan: 19 screens + shared UI components.
> react-native-svg digunakan untuk custom stroke icon set (Lucide-style) dari design.
> Verifikasi di device berhasil 2026-05-30: Redmi Note 8, Android Bundled 14309ms, tidak ada error merah.
> Repo: https://github.com/ruhaparelstudio-star/arisan-mobile.git
> Branch: main. Commit: "feat(mo): MO-0 initial mobile scaffold with Hi-Fi design implementation"

---

## MO-1 — Auth & Onboarding

```
[x] src/api/auth.ts — authApi.sendOTP(), authApi.verifyOTP()
[x] src/hooks/useAuth.ts — token, user, login(), logout(), isLoading
[x] SplashScreen.tsx
    [x] Ilustrasi Hi-Fi, tagline, 2 tombol CTA (Mulai sekarang + Sudah punya akun outline)
[x] PhoneInputScreen.tsx
    [x] Prefix +62 terpisah, input angka
    [x] Validasi lokal format nomor (9–13 digit)
    [x] Loading, error, disabled state
    [x] 429: "Terlalu banyak percobaan. Coba lagi dalam 1 jam."
    [x] 503: "Gagal mengirim OTP. Tunggu 30 detik lalu coba lagi."
[x] OTPVerifyScreen.tsx
    [x] 6 kotak auto-advance + auto-submit saat 6 digit
    [x] Countdown 5 menit + expired message
    [x] Error spesifik: OTP salah + sisa percobaan, expired, 429, 503
    [x] Tombol kirim ulang (aktif setelah 30 detik)
[x] LoginSuccessScreen.tsx
    [x] Nama + nomor dari response
    [x] Tombol "Ke beranda" + auto-navigate 2 detik
    [x] login() dipanggil di sini, navigator switch otomatis via RootNavigator
[x] JWT tersimpan di SecureStore (bukan AsyncStorage)
[x] Auto-login: cek token di SecureStore saat app start (isLoading)
[x] Logout: hapus SecureStore + RootNavigator switch ke AuthNavigator
[x] Semua pesan error Bahasa Indonesia
[x] Mockup: tidak ada di .claude/designs/ — pakai Design System + Hi-Fi dari MO-0
```

**Mockup tersedia:**
> `[ ]` Ya — diikuti persis
> `[x]` Tidak — pakai Design System (Hi-Fi dari MO-0 scaffold)

**Catatan:**
> Sesi MO-1 selesai 2026-05-30. Branch: feature/mo-w02-auth.
> Alur login: OTPVerify → navigate LoginSuccess (sebelum login()) → login() di LoginSuccess → RootNavigator switch ke AppNavigator.
> TypeScript check: 0 errors. Tidak ada dependency baru.

---

## MO-2 — Manajemen Grup

```
[x] src/api/groups.ts — getMyGroups(), getGroupDetail(), createGroup(), joinGroup(), getGroupByCode(), leaveGroup(), generateInvite(), setSlotOrder(), disbandGroup()
[x] src/components/GrupCard.tsx — sudah ada dari MO-0
[x] HomeScreen.tsx
    [x] List grup, skeleton loading (3 item), empty state
    [x] Badge "Ketua" tidak ditampilkan di HomeScreen list (pakai ListRow bukan GrupCard — data API tidak ada member_count/due_date)
    [x] Tombol Buat Grup + Gabung Grup (disabled saat offline)
    [x] OfflineBanner
[x] BuatGrupScreen.tsx (3 langkah: Step1 nama, Step2 nominal+frekuensi+periode, Step3 mode undian)
    [x] Validasi lokal sebelum submit (nama tidak kosong, nominal dipilih)
    [x] Error 403 "Sudah 3 grup aktif" ditampilkan secara eksplisit
    [x] Success → navigate ke InviteScreen
[x] DetailGrupScreen.tsx
    [x] Info grup + invite code dengan Copy/Share (jika status recruiting)
    [x] List anggota + status bayar
    [x] Ketua detection: group.created_by === user.id
    [x] Tombol ketua: Set Giliran, Generate Invite Baru, Bubarkan Grup (+ Alert konfirmasi)
    [x] Tombol anggota: Keluar Grup (+ Alert konfirmasi)
    [x] OfflineBanner
[x] InviteScreen.tsx — kode + Copy + Share + navigate ke GroupDetail
[x] JoinGrupScreen.tsx
    [x] Input 8 karakter (OtpBoxes), auto uppercase, tombol disabled < 8 char
    [x] Preview info grup via JoinConfirmScreen sebelum konfirmasi
    [x] Error: tidak valid, grup penuh, limit 3 grup (di JoinConfirmScreen)
[~] SetGiliranScreen.tsx
    [x] List anggota + nomor urutan, tombol panah ↑↓ untuk reorder
    [x] Tombol "Simpan Urutan" → setSlotOrder()
    [ ] Drag & drop — menunggu konfirmasi library dari developer
[x] OfflineBanner aktif di HomeScreen dan DetailGrupScreen
[x] navigation/types.ts + AppNavigator: SetGiliran terdaftar
[x] Icon.tsx: arrowUp + arrowDown ditambahkan
```

**Catatan:**
> Sesi MO-2 selesai 2026-05-30. Branch: feature/mo-2-groups.
> SetGiliranScreen menggunakan tombol ↑↓ karena library drag & drop belum dikonfirmasi developer.
> HomeScreen menggunakan ListRow (bukan GrupCard) karena API /api/groups tidak mengembalikan member_count dan due_date yang dibutuhkan GrupCard.
> Semua pesan error dalam Bahasa Indonesia. Aksi kritis disabled saat offline.

---

## MO-3 — Tracking Pembayaran

```
[ ] src/api/payments.ts
[ ] src/hooks/usePaymentRealtime.ts — Supabase Realtime
[ ] PaymentStatusScreen.tsx
    [ ] Progress bar bayar
    [ ] List anggota + status (lunas/belum/terlambat)
    [ ] Timestamp konfirmasi
    [ ] Tap anggota (ketua): modal konfirmasi
    [ ] Badge "Live" di header
    [ ] Disabled saat offline
[ ] PaymentHistoryScreen.tsx
    [ ] Accordion per periode
    [ ] List anggota + status per periode
[ ] Cache status bayar di AsyncStorage
[ ] Label "Data terakhir diperbarui" saat offline
[ ] Realtime update tanpa reload penuh
```

**Catatan:**
> _(isi setelah sesi)_

---

## MO-4 — Sistem Undian

```
[ ] src/api/undian.ts
[ ] UndianScreen.tsx
    [ ] Tampilkan anggota yang belum menang
    [ ] Tombol "Mulai Undian" — ketua only
    [ ] Loading animasi saat proses
    [ ] Tampilkan hasil: nama pemenang
[ ] RiwayatPemenangScreen.tsx
    [ ] List pemenang per periode
    [ ] Read-only, tidak ada delete
[ ] System message dari undian muncul di chat
```

**Catatan:**
> _(isi setelah sesi)_

---

## MO-5 — Tukar Giliran

```
[ ] src/api/swaps.ts
[ ] RequestSwapScreen.tsx — pilih target anggota
[ ] SwapInboxScreen.tsx — list swap masuk (terima/tolak)
[ ] SwapApprovalScreen.tsx — list swap pending (ketua)
[ ] Notif push muncul saat ada swap request/response
[ ] Integrasi dengan activity_log di DetailGrupScreen
```

**Catatan:**
> _(isi setelah sesi)_

---

## MO-6 — Chat & Activity Log

```
[ ] npm install: stream-chat-expo, stream-chat-react-native (konfirmasi)
[ ] ChatScreen.tsx
    [ ] MessageList + MessageInput
    [ ] Badge "Ketua" di nama ketua
    [ ] Disable delete message (konfigurasi Stream)
    [ ] Infinite scroll 30 pesan
    [ ] Typing indicator
    [ ] Offline banner + disable input saat offline
[ ] ActivityLogScreen.tsx
    [ ] List item: timestamp + aktor + deskripsi
    [ ] Read-only, infinite scroll
    [ ] Empty state
```

**Catatan:**
> _(isi setelah sesi)_

---

## MO-7 — Offline Mode

```
[ ] src/utils/cache.ts — TTL 24 jam, semua cache keys
[ ] src/hooks/useNetworkStatus.ts aktif di semua screen
[ ] OfflineBanner: slide up/down animasi
[ ] HomeScreen: load dari cache jika offline
[ ] DetailGrupScreen: load dari cache jika offline
[ ] PaymentStatusScreen: load dari cache + label "terakhir diperbarui"
[ ] Semua aksi kritis disabled + tooltip saat offline:
    [ ] Konfirmasi Bayar
    [ ] Mulai Undian
    [ ] Kirim Chat
    [ ] Buat/Join Grup
    [ ] Request Swap
[ ] Auto-refresh saat kembali online
[ ] Skeleton loading (bukan blank) untuk koneksi lambat
```

**Catatan:**
> _(isi setelah sesi)_

---

## MO-8 — Beta Launch

```
[ ] Privacy Policy: link di onboarding dan screen profil
[ ] E2E test manual: login → buat grup → bayar → undian
[ ] Performance di device fisik:
    [ ] HomeScreen load < 2 detik (4G)
    [ ] Realtime update < 1 detik
[ ] Firebase Crashlytics aktif
[ ] Build APK/AAB: npx expo build:android atau EAS
[ ] Upload ke Google Play Console (Closed Testing)
[ ] Monitor 2 minggu: crash rate < 1%, OTP success > 95%
[ ] NPS survey ke beta users (target > 7/10)
```

**Catatan:**
> _(isi setelah sesi)_

---

## Keputusan Teknis

```
[isi setelah setiap sesi]
```

## Blocker Aktif

```
(kosong)
```
