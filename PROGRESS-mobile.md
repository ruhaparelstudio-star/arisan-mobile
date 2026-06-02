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
| MO-3 | Tracking Pembayaran | `[x]` |
| MO-4 | Sistem Undian | `[x]` |
| MO-5 | Tukar Giliran | `[x]` |
| MO-6 | Chat & Activity Log | `[x]` |
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
[x] src/api/payments.ts
    [x] getPayments(token, groupId, periodId)
    [x] confirmPayment(token, groupId, periodId, userId) — single member
    [x] cancelConfirm(token, groupId, periodId, userId) — DELETE, single member
    [x] getPeriods(token, groupId)
[x] src/hooks/usePaymentRealtime.ts — Supabase Realtime
    [x] filter: period_id=eq.{periodId} (bukan group_id)
    [x] terima initial: Payment[] — return payments state (bukan callback)
    [x] sync ulang jika initial berubah (setelah fetch ulang)
[x] PaymentStatusScreen.tsx
    [x] Title: "Status Bayar — Periode [N]"
    [x] Progress bar: [X]/[Y] anggota sudah bayar
    [x] Jatuh tempo — merah jika sudah lewat
    [x] Badge "Live" (Pill solid) di header jika online
    [x] List anggota semua: ✓ Lunas (hijau) + timestamp, ⏰ Belum bayar (abu), ⚠ Terlambat (merah)
    [x] Tap anggota (ketua) → Modal: "Konfirmasi bayar [nama]?" / "Batalkan konfirmasi?"
    [x] Modal confirm/cancel dengan aksi async + loading state
    [x] OfflineBanner
    [x] Disabled tap + aksi saat offline
    [x] Cache status bayar ke AsyncStorage (CACHE_KEYS.payments)
    [x] Label "Data terakhir diperbarui: [waktu]" saat offline
    [x] Fetch group detail untuk isKetua + resolusi nama konfirmator
[x] PaymentHistoryScreen.tsx
    [x] Accordion per periode — sort periode terbaru dulu
    [x] Expand → lazy fetch payments anggota per periode
    [x] List anggota + status (Lunas/Telat/Belum) per periode
    [x] Loading state per accordion item
[x] Cache status bayar di AsyncStorage
[x] Label "Data terakhir diperbarui" saat offline
[x] Realtime update tanpa reload penuh
[x] chevronUp ditambahkan ke Icon.tsx
```

**Catatan:**
> Sesi MO-3 selesai 2026-05-30. Branch: feature/mo-3-payments.
> usePaymentRealtime direfactor: filter by period_id (bukan group_id), return state bukan callback.
> PaymentStatusScreen: fetch group detail + payments + periods untuk isKetua, due date, confirmer name.
> PaymentHistoryScreen: accordion lazy-load — payments per periode di-fetch saat expand (bukan preload semua).
> confirmPayments (array) diganti confirmPayment (single) + cancelConfirm (single DELETE) — konsisten dengan spec.
> Realtime: belum ditest dengan 2 device (butuh 2 device fisik dengan Supabase aktif).

---

## MO-4 — Sistem Undian

```
[x] src/api/undian.ts
    [x] undianApi.start(groupId, mode, periodId, winnerId?, token?) — POST /api/groups/:id/undian
    [x] undianApi.getHistory(groupId, token) — GET /api/groups/:id/winners
[x] UndianScreen.tsx
    [x] Fetch real candidates: getGroupDetail + getHistory → filter members belum menang
    [x] Tombol "Mulai Undian" — ketua only (isKetua dari route params)
    [x] Anggota: read-only view, tidak ada tombol mulai
    [x] Loading spinner "Sedang mengundi..." saat proses (LoadingView + cycle nama)
    [x] Hasil diteruskan ke UndianResult dari response API (bukan random client)
    [x] Error state: Alert.alert (bukan navigate UndianError)
    [x] Disabled saat offline + tooltip
[x] RiwayatPemenangScreen.tsx
    [x] List pemenang per periode (sort terbaru dulu)
    [x] Read-only, tidak ada delete — ada immutable note
    [x] Empty state: "Belum ada pemenang"
    [x] Error state + loading skeleton
    [x] Pull-to-refresh
[x] UndianResultScreen.tsx: hapus MOCK_WINNERS, tambah navigasi ke RiwayatPemenang
[x] navigation/types.ts: tambah RiwayatPemenang, isKetua di UndianPre, periodeKe di UndianResult
[x] AppNavigator.tsx: daftarkan RiwayatPemenangScreen
[x] DetailGrupScreen.tsx: pass isKetua saat navigate ke UndianPre
[ ] System message dari undian muncul di chat (server-side — BE-4)
```

**Catatan:**
> Sesi MO-4 selesai 2026-05-30. Branch: feature/mo-4-undian.
> UndianScreen: candidates dihitung dari group members dikurangi pemenang history (2 API call paralel).
> isKetua dipass sebagai route param dari DetailGrupScreen (sudah tersedia di sana).
> System message di chat dihandle server-side oleh BE-4 — tidak ada logika di client.
> UndianError dihapus dari types (tidak ada screen implementasinya), diganti Alert.alert inline.
> TypeScript check: 0 errors. Tidak ada dependency baru.

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
[x] Tidak install stream-chat-expo — pakai custom UI + backend API proxy
[x] src/api/chat.ts: ChatMessage, ActivityLogEntry types + getMessages, sendMessage, getActivityLog
[x] navigation/types.ts: tambah ketuaId ke Chat params
[x] ChatScreen.tsx
    [x] FlatList inverted (pesan terbaru di bawah)
    [x] Badge "Ketua" di nama ketua (ketuaId dari route params)
    [x] Delete message tidak diimplementasi di UI (read-only list)
    [x] Infinite scroll 30 pesan via loadMore (onEndReached)
    [x] Polling real-time tiap 4 detik saat online (pengganti WebSocket)
    [x] Offline banner + disable input saat offline
    [x] Skeleton loading 5 bubble
    [x] Error state + tombol "Coba Lagi"
    [x] System messages ditampilkan (type: 'system')
[x] ActivityLogScreen.tsx
    [x] Fetch real dari GET /api/groups/:id/activity-log
    [x] Format timestamp: "12 Jun 2026 · 14:30"
    [x] Read-only (FlatList tanpa swipe gesture)
    [x] Infinite scroll 30 item via loadMore
    [x] Loading state (ActivityIndicator)
    [x] Empty state via StateView
    [x] Error state + tombol "Coba Lagi"
[x] DetailGrupScreen: pass ketuaId (group.created_by) saat navigate ke Chat
[x] UndianResultScreen: fix navigate Chat dengan ketuaId
[x] TypeScript: 0 errors. Tidak ada dependency baru.
```

**Catatan:**
> Sesi 2026-05-30. stream-chat-expo tidak diinstall (keputusan developer). Chat menggunakan custom UI dengan polling 4 detik ke backend API proxy. Typing indicator tidak diimplementasi (perlu WebSocket/SDK). Backend wajib expose: GET /api/groups/:id/messages, POST /api/groups/:id/messages, GET /api/groups/:id/activity-log.

---

## MO-7 — Offline Mode

```
[x] src/utils/cache.ts — TTL 24 jam, semua cache keys
[x] src/hooks/useNetworkStatus.ts aktif di semua screen
[x] OfflineBanner: slide up/down animasi
[x] HomeScreen: load dari cache jika offline
[x] DetailGrupScreen: load dari cache jika offline
[x] PaymentStatusScreen: load dari cache + label "terakhir diperbarui"
[x] Semua aksi kritis disabled + tooltip saat offline:
    [x] Konfirmasi Bayar
    [x] Mulai Undian
    [x] Kirim Chat
    [x] Buat/Join Grup
    [x] Request Swap
[x] Auto-refresh saat kembali online
[x] Skeleton loading (bukan blank) untuk koneksi lambat
```

**Catatan:**
> Selesai di sesi MO-7 (2026-05-30). Cache AsyncStorage TTL 24 jam. OfflineBanner animasi slide. Semua aksi kritis disabled.

---

## MO-8 — Beta Launch

```
[x] Privacy Policy: link di onboarding dan screen profil
[ ] E2E test manual: login → buat grup → bayar → undian  ← manual, butuh device fisik
[ ] Performance di device fisik:
    [ ] HomeScreen load < 2 detik (4G)                   ← manual, butuh device fisik
    [ ] Realtime update < 1 detik                        ← manual, butuh Supabase aktif
[ ] Firebase Crashlytics aktif                           ← konfigurasi post-build
[ ] Build APK/AAB: npx expo build:android atau EAS       ← eksekusi developer
[ ] Upload ke Google Play Console (Closed Testing)       ← eksekusi developer
[ ] Monitor 2 minggu: crash rate < 1%, OTP success > 95% ← post-launch
[ ] NPS survey ke beta users (target > 7/10)             ← post-launch
```

**Catatan:**
> Sesi MO-8 selesai 2026-05-30.
> Privacy Policy URL: EXPO_PUBLIC_PRIVACY_POLICY_URL (isi di .env sebelum build).
> SplashScreen: teks "Dengan melanjutkan, kamu setuju dengan Kebijakan Privasi kami" di bawah CTA. Link → Linking.openURL.
> ProfileScreen: menu item "Kebijakan Privasi" (icon fileText) → Linking.openURL. Icon fileText ditambahkan ke Icon.tsx.
> E2E + performance + build + monitoring = manual/operational, bukan kode.
> TypeScript: 0 errors. Tidak ada dependency baru.

---

---

## MO-12 — Gap Resolution (PRD v1.3)

```
[x] OTPVerifyScreen: tambah failCount state — support link muncul setelah 3× gagal berturut-turut
[x] groups.ts: tambah swap_count (jumlah_tukar) ke GroupMember interface + adaptMember
[x] RequestSwapScreen: tampilkan sisa batas tukar (swap_count/2) + disable tombol jika limit tercapai

SUDAH DIFIX DI SESI SEBELUMNYA (dikonfirmasi dari review kode):
[x] UndianScreen: draw_mode dibaca dari group.draw_mode (bukan hardcoded 'random')
[x] DetailGrupScreen: myPeriod dibaca dari member.slot_order (bukan hardcoded 1)
[x] usePaymentRealtime: DELETE event ditangani via payload.old
[x] DetailGrupScreen: guard current_period_id sebelum navigate ke Bayar
[x] groups.ts adaptMember: null guard raw.users → { name: 'Pengguna Dihapus' }
[x] DetailGrupScreen: winner guard null current_period
[x] SwapInboxScreen: guard user?.id di load() + dependency array
[x] UndianResultScreen: ketuaId diteruskan dari route.params (sudah fix di MO-DESIGN-SYNC)
[x] PaymentStatusScreen: audit trail "Dikonfirmasi oleh [Nama] · [waktu]" sudah tampil
[x] RequestSwapScreen: anggota tanpa slot_order ditampilkan sebagai disabled (bukan disembunyikan)
```

**TIDAK BISA DILAKUKAN TANPA KONFIRMASI DEVELOPER:**
```
[ ] Firebase Crashlytics — perlu: npm install @react-native-firebase/app @react-native-firebase/crashlytics
    → download google-services.json dari Firebase Console
    → tambah ke plugins di app.json
    → npx expo prebuild --clean && npx expo run:android --device
[ ] MO-5 PROGRESS (PROGRESS-mobile.md belum diupdate) — item belum dicheck
```

**Catatan:**
> Sesi MO-12 selesai 2026-06-01. TypeScript: 0 errors. Tidak ada dependency baru.
> jumlah_tukar dari backend: backend harus memastikan field ini di-include dalam query group members (group_members.jumlah_tukar).
> OTP fail counter: reset otomatis saat user ganti kode (OTP berhasil → navigate away). Tidak perlu reset eksplisit.

---

## Keputusan Teknis

```
MO-12 (2026-06-01):
- Firebase Crashlytics tidak diinstall (butuh konfirmasi developer, perlu google-services.json)
- swap_count (jumlah_tukar) ditambahkan ke GroupMember — backend perlu expose field ini di GET /groups/:id
- OTP fail counter berbasis state lokal (tidak persist), reset saat navigasi keluar screen
```

## Blocker Aktif

```
- Firebase Crashlytics: butuh konfirmasi developer untuk install @react-native-firebase/app + @react-native-firebase/crashlytics
- Backend: pastikan jumlah_tukar field direturn di GET /api/groups/:id response (group_members query)
```
