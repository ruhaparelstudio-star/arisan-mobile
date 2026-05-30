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
| MO-1 | Auth & Onboarding | `[ ]` |
| MO-2 | Manajemen Grup | `[ ]` |
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
[ ] Verifikasi: npx expo run:android --device berhasil di device
[x] GitHub Actions: ci.yml
```

**Catatan:**
> Sesi MO-0 selesai 2026-05-30. Stack: Expo SDK 52, React Native 0.76.7, TypeScript 5.
> Expo SDK: ~52.0.0. Font: Space Grotesk + Plus Jakarta Sans via @expo-google-fonts.
> Semua screens dari Hi-Fi design diimplementasikan: 19 screens + shared UI components.
> react-native-svg digunakan untuk custom stroke icon set (Lucide-style) dari design.
> Verifikasi di device belum dilakukan — perlu `npm install` dan `npx expo run:android --device`.
> Repo: https://github.com/ruhaparelstudio-star/arisan-mobile.git
> Branch: main. Commit: "feat(mo): MO-0 initial mobile scaffold with Hi-Fi design implementation"

---

## MO-1 — Auth & Onboarding

```
[ ] src/api/auth.ts — sendOTP(), verifyOTP()
[ ] src/hooks/useAuth.ts — token, user, login(), logout()
[ ] SplashScreen.tsx
    [ ] Logo, tagline, 2 tombol CTA
    [ ] Semua states (lihat checklist screen)
[ ] PhoneInputScreen.tsx
    [ ] Prefix +62 terpisah, input angka
    [ ] Validasi lokal format nomor
    [ ] Loading, error, disabled state
[ ] OTPVerifyScreen.tsx
    [ ] 6 kotak auto-advance
    [ ] Countdown 5 menit
    [ ] Error pesan spesifik (salah, expired, Fonnte gagal)
    [ ] Tombol kirim ulang (aktif 30 detik)
[ ] LoginSuccessScreen.tsx
    [ ] Nama + nomor dari response
    [ ] Auto-navigate 2 detik
[ ] JWT tersimpan di SecureStore (bukan AsyncStorage)
[ ] Auto-login: cek token di SecureStore saat app start
[ ] Logout: hapus SecureStore + navigate ke Splash
[ ] Semua pesan error Bahasa Indonesia
[ ] Cek mockup .claude/designs/ untuk semua screen ini
```

**Mockup tersedia:**
> `[ ]` Ya — diikuti persis
> `[ ]` Tidak — pakai Design System

**Catatan:**
> _(isi setelah sesi)_

---

## MO-2 — Manajemen Grup

```
[ ] src/api/groups.ts — getMyGroups(), createGroup(), joinGroup(), dll
[ ] src/components/GrupCard.tsx
[ ] HomeScreen.tsx
    [ ] List grup, skeleton loading, empty state
    [ ] Badge "Ketua" jika user adalah ketua
    [ ] Tombol Buat Grup + Gabung Grup
[ ] BuatGrupScreen.tsx
    [ ] Form: nama, nominal, frekuensi, jumlah periode, mode undian
    [ ] Validasi lokal sebelum submit
    [ ] Success → navigate ke DetailGrupScreen
[ ] DetailGrupScreen.tsx
    [ ] Info grup + invite code (jika recruiting)
    [ ] List anggota + urutan
    [ ] Tombol ketua: Set Giliran, Generate Invite, Bubarkan
    [ ] Tombol anggota: Keluar Grup
[ ] InviteScreen.tsx
    [ ] Tampilkan kode + tombol Copy + Share
[ ] JoinGrupScreen.tsx
    [ ] Input 8 karakter, auto uppercase
    [ ] Preview info grup sebelum konfirmasi
    [ ] Error: tidak valid, penuh, limit 3 grup
[ ] SetGiliranScreen.tsx
    [ ] Drag & drop reorder anggota
    [ ] Library: konfirmasi dulu dengan developer
[ ] OfflineBanner aktif di HomeScreen dan DetailGrupScreen
```

**Catatan:**
> _(isi setelah sesi)_

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
