# arisan-mobile — CLAUDE.md

> Letakkan file ini di root `arisan-mobile/CLAUDE.md`.
> Dibaca otomatis oleh Claude Code di setiap sesi mobile.
> Update section "Catatan Sesi" setelah setiap sesi selesai.

---

## Stack

- **Framework:** React Native + Expo (SDK terbaru)
- **Language:** TypeScript
- **Navigation:** React Navigation Native Stack
- **State:** React hooks — tidak ada Redux/Zustand/MobX
- **Secure Storage:** `expo-secure-store` (JWT token)
- **Cache:** `AsyncStorage` (data offline, TTL 24 jam)
- **API:** selalu lewat `src/api/client.ts` — jangan `fetch` langsung
- **Push Notif:** `expo-notifications`
- **Chat:** Stream.io (`stream-chat-expo`, `stream-chat-react-native`)
- **Realtime:** Supabase Realtime (status bayar)
- **Dev:** USB device — `npx expo run:android --device`

---

## Struktur File

```
src/
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.tsx
│   │   ├── PhoneInputScreen.tsx
│   │   ├── OTPVerifyScreen.tsx
│   │   └── LoginSuccessScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── groups/
│   │   ├── BuatGrupScreen.tsx
│   │   ├── DetailGrupScreen.tsx
│   │   ├── InviteScreen.tsx
│   │   ├── JoinGrupScreen.tsx
│   │   └── SetGiliranScreen.tsx
│   ├── payments/
│   │   ├── PaymentStatusScreen.tsx
│   │   └── PaymentHistoryScreen.tsx
│   ├── undian/
│   │   ├── UndianScreen.tsx
│   │   └── RiwayatPemenangScreen.tsx
│   ├── swaps/
│   │   ├── RequestSwapScreen.tsx
│   │   ├── SwapInboxScreen.tsx
│   │   └── SwapApprovalScreen.tsx
│   └── chat/
│       ├── ChatScreen.tsx
│       └── ActivityLogScreen.tsx
├── components/
│   ├── OfflineBanner.tsx     ← wajib di semua screen utama
│   ├── GrupCard.tsx
│   └── AnggotaItem.tsx
├── api/
│   ├── client.ts             ← base fetch wrapper — gunakan ini
│   ├── auth.ts
│   ├── groups.ts
│   ├── payments.ts
│   └── notifications.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useNetworkStatus.ts
│   └── usePaymentRealtime.ts
└── utils/
    ├── cache.ts              ← AsyncStorage + TTL
    └── storage.ts            ← SecureStore wrapper
```

---

## Environment Variables

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
EXPO_PUBLIC_STREAM_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

---

## UI/UX — Aturan Wajib

### Prioritas (urutan ketat)

1. **Cek `.claude/designs/`** — jika ada mockup untuk screen ini → **ikuti persis**
2. **Jika tidak ada mockup** → ikuti Design System di bawah
3. **Konfirmasi ke developer** sebelum mulai jika tidak yakin

### Color Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| Primary | `#00C897` | Tombol, border aktif, ikon, badge |
| Primary Light | `#E6FAF5` | Background badge, section |
| Background | `#FFFFFF` | Screen |
| Surface | `#F8F8F8` | Card, section |
| Text Primary | `#111111` | Judul, body |
| Text Secondary | `#888888` | Subtitle, hint |
| Text Hint | `#AAAAAA` | Placeholder |
| Border Default | `#E0E0E0` | Input, card |
| Border Active | `#00C897` | Input focused |
| Error | `#EF4444` | Error, offline banner |
| Error Light | `#FEF2F2` | Error background |

### Komponen Standar

**Tombol Primary:**
- `width: '100%'`, `height: 48`, `backgroundColor: '#00C897'`
- `color: '#FFFFFF'`, `fontWeight: 'bold'`, `borderRadius: 10`
- Disabled: `backgroundColor: '#CCCCCC'`

**Tombol Outline:**
- `backgroundColor: '#FFFFFF'`, `borderWidth: 1.5`, `borderColor: '#00C897'`
- `color: '#00C897'`, `borderRadius: 10`, `height: 48`

**Input:**
- `height: 48`, `borderWidth: 1.5`, `borderRadius: 7`
- Default: `borderColor: '#E0E0E0'` → Focused: `borderColor: '#00C897'`

**Card:**
- `backgroundColor: '#FFFFFF'`, `borderWidth: 1`, `borderColor: '#E0E0E0'`
- `borderRadius: 12`, `padding: 16`

**OfflineBanner:**
- `backgroundColor: '#EF4444'`, `height: 36`, teks putih
- Posisi: tepat di bawah header, bukan modal

### Layout

- Screen root: `SafeAreaView`
- Screen dengan input: `KeyboardAvoidingView`
- Padding horizontal: `16`
- Gap vertikal antar komponen: `12`

---

## States Wajib Per Screen

Semua screen WAJIB handle:

```
Loading  → skeleton atau ActivityIndicator (bukan blank)
Error    → pesan error Bahasa Indonesia + tombol "Coba Lagi"
Empty    → teks deskriptif + CTA (bukan blank)
Offline  → OfflineBanner + data cache jika ada + aksi kritis disabled
```

---

## Rules Wajib

- **Jangan** fetch langsung — pakai `src/api/client.ts`
- **Jangan** simpan JWT di AsyncStorage — pakai SecureStore
- **Jangan** install dependency baru tanpa konfirmasi
- Semua pesan error ke user dalam **Bahasa Indonesia**
- `OfflineBanner` wajib di: HomeScreen, DetailGrupScreen, PaymentStatusScreen, ChatScreen
- Aksi disabled saat offline: Konfirmasi Bayar, Mulai Undian, Kirim Chat, Buat/Join Grup, Request Swap
- Tooltip disabled: "Butuh koneksi internet untuk melakukan aksi ini"

---

## Git Workflow

Branch strategy sama dengan arisan-api:

```bash
# Mulai sesi baru dari develop
git checkout develop
git pull origin develop
git checkout -b feature/mo-X-<nama>

# Setelah selesai — CI harus hijau dulu
git checkout develop
git merge feature/mo-X-<nama> --no-ff
git push origin develop
git branch -D feature/mo-X-<nama>
git push origin --delete feature/mo-X-<nama>
```

- Branch `develop` = base development
- Setiap sesi MO-X buat branch baru `feature/mo-X-<nama>`
- CI jalan otomatis di branch `feature/**` dan `develop`
- Merge ke `develop` hanya kalau CI passed
- PR ke `main` hanya untuk release

---

## Referensi

- API URL: `EXPO_PUBLIC_API_URL`
- Progress: `PROGRESS-mobile.md`
- Mockup: `.claude/designs/`
- Dev guide: `../DEVELOPMENT_GUIDE.md`

---

## Jika Ragu

**STOP dan tanya developer.** Terutama untuk:
- Screen tanpa mockup di `.claude/designs/`
- Dependency baru
- Navigasi di luar scope sesi

---

## Catatan Sesi

> Claude mengisi bagian ini setelah setiap sesi.

```
[PRE-PROD FIX · 2026-06-01 — 3 Production Blockers Diperbaiki]
Ditemukan dari gap audit setelah live device testing. TypeScript 0 errors mobile + backend.

FIX 1 — ProfileScreen stats hardcoded:
- Masalah: "Rp 0 Total iuran" dan "0× Menang" selalu statis, tidak pernah update.
- Fix backend: tambah GET /api/users/me/stats (group_count, total_iuran, win_count).
  - group_count: COUNT dari group_members WHERE user_id
  - total_iuran: SUM nominal dari payments CONFIRMED JOIN periods→groups
  - win_count: COUNT dari winners WHERE user_id
- Fix mobile: ProfileScreen ganti getUserStats() dan render stats real.
- File: arisan-api/src/routes/users.ts, mobile/src/screens/home/ProfileScreen.tsx

FIX 2 — DetailGrupScreen tidak auto-refresh saat kembali fokus:
- Masalah: setelah dari Bayar/Undian/Chat, DetailGrup data stale sampai pull-to-refresh manual.
- Fix: tambah useFocusEffect(useCallback(() => load(), [load])) — sama dengan pola HomeScreen/GroupsScreen.
- File: src/screens/groups/DetailGrupScreen.tsx

FIX 3 — System messages dari backend (konfirmasi bayar, hasil undian, swap) tidak muncul di ChatScreen mobile:
- Masalah: backend sendSystemMessage() kirim ke Stream.io channel, tapi mobile baca dari Supabase messages table.
- Root cause: user_id null diizinkan oleh Supabase (FK tidak block null), tapi tidak ada kolom 'type'.
- Fix backend: sendSystemMessage() sekarang INSERT ke Supabase messages dengan user_id=null (system message).
- Fix mobile chat.ts: fetchMessages + subscribeMessages deteksi type='system' dari user_id==null.
- File: arisan-api/src/services/streamio.ts, mobile/src/api/chat.ts

[DEVICE-TEST · 2026-06-01 — Live Device Testing (Redmi Note 8), 4 Iterasi Loop COMPLETE]
Test end-to-end di device fisik via USB + adb. Port forwarding: adb reverse tcp:3001 tcp:3001 (backend) + tcp:8081 tcp:8081 (Metro).
Metro HARUS dijalankan via `npx expo run:android` bukan `npx expo start` (APK debug hanya tahu cara load bundle dari expo run:android Metro).

ALUR YANG BERHASIL DITEST:
- Splash → PhoneInput → OTPVerify → LoginSuccess → HomeScreen: ✅ semua berfungsi
- BuatGrupStep1 → Step2 → Step3 → InviteScreen → DetailGrupScreen: ✅
- ChatScreen: kirim pesan realtime ✅, filter tab (Semua/Obrolan/Sistem) ✅
- ProfileScreen: data real, menu lengkap ✅
- NotificationsScreen: empty state benar ✅
- Tab navigation: Beranda/Grup/Notifikasi/Profil ✅

ALUR YANG BERHASIL DITEST (iterasi 2, 3, 4 — COMPLETE):
- BuatGrupStep1→2→3: ✅ nama/nominal/frekuensi/periode/mode undian semua berfungsi
- InviteScreen: ✅ kode HPTH9ZGD muncul, member list real-time polling, WA share, copy
- DetailGrupScreen: ✅ status card (periode, jatuh tempo, progress, winner), quick actions, ketua actions
- ChatScreen: ✅ kirim pesan realtime ke Supabase, broadcast undian tampil
- HomeScreen hero card: ✅ menampilkan "PERLU PERHATIAN" + Bayar button saat ada jatuh tempo
- PaymentStatusScreen: ✅ member rows tampil, progress bar, realtime update, konfirmasi bayar (1/1 Lunas)
- UndianScreen: ✅ candidate list real, "Mulai Undian", animasi, navigate ke UndianResult
- UndianResultScreen: ✅ winner spotlight, daftar pemenang, "Ucapkan selamat di chat", "Lihat semua"
- RiwayatPemenangScreen: ✅ list per periode dengan tanggal
- PaymentHistoryScreen: ✅ accordion per periode, lazy-fetch payments per periode saat expand
- ActivityLogScreen: ✅ list entri aktivitas dengan timestamp (Undian, Bayar, Buat Grup)
- GroupsScreen: ✅ tab Semua/Ketua/Anggota, group card dengan info real
- ProfileScreen: ✅ stat, edit nama, menu, Kebijakan Privasi
- NotificationsScreen: ✅ empty state benar
- SwapInboxScreen: ✅ incoming requests tampil, Accept berfungsi
- SwapApprovalScreen: ✅ waiting_ketua swaps tampil, Setujui berfungsi
- Full Swap flow end-to-end: ✅ Request (user2) → Accept (target/user1) → Approve (ketua) berhasil

DEAD NAVIGATION YANG SUDAH DIPERBAIKI:
- PaymentHistoryScreen: tidak bisa diakses → tambah tombol "Riwayat" di section Status Bayar DetailGrupScreen
- SwapInboxScreen: tidak bisa diakses → tambah opsi di submenu Tukar button DetailGrupScreen
- SwapApprovalScreen: tidak bisa diakses → tambah tombol "Approval Tukar" di Ketua Actions DetailGrupScreen

BUGS DITEMUKAN & DIPERBAIKI (mobile):
1. HomeScreen tidak auto-refresh setelah buat/join grup:
   - Masalah: useEffect([loadGroups]) hanya fire saat token/isOnline berubah, tidak saat kembali ke screen.
   - Fix: tambah useFocusEffect(useCallback(() => load(), [load])) di HomeScreen + GroupsScreen.
   - Sekarang list grup auto-update setiap kali screen difokus.

2. DetailGrupScreen undian hint muncul salah untuk periode 1 (Mode 2 random):
   - Masalah: `prevPeriodClosed` di-init ke `false` → undianMode2Blocked = true → hint muncul salah
   - Fix: init `prevPeriodClosed` ke `true` (safe default — periode 1 tidak ada periode sebelumnya)
   - File: src/screens/groups/DetailGrupScreen.tsx:95

3. GroupsScreen tidak auto-refresh saat kembali fokus:
   - Fix: tambah useFocusEffect (sama dengan HomeScreen)
   - File: src/screens/groups/GroupsScreen.tsx

4. UndianScreen broadcast nama kosong ketika user.name = null:
   - Masalah: `${result.winner.name}` → null → "**" di chat dan activity log
   - Fix mobile: fallback `result.winner.name || 'anggota'` di UndianScreen.tsx
   - Fix backend: `winnerName = winnerUser?.name || winnerUser?.phone || 'anggota'` di undian.ts

5. PaymentHistory screen tidak bisa diakses dari mana pun (dead navigation):
   - Fix: tambah tombol "Riwayat" di sebelah "Kelola" pada section "Status bayar" di DetailGrupScreen.tsx

BUGS DITEMUKAN & DIPERBAIKI (backend arisan-api):
1. PaymentStatusScreen kosong — backend payments query gagal dengan ambiguous FK:
   - Masalah: `select('*, users(id,name,phone)')` gagal karena ada >1 FK dari payments ke users
   - Error: "Could not embed because more than one relationship was found"
   - Fix: ganti ke `select('*, users!user_id(id,name,phone)')` di arisan-api/src/services/payments.ts
   - Akibat: getPayments() selalu return [] → PaymentStatusScreen selalu kosong

2. undian.ts: winnerName fallback ke empty string saat name null → activity log dan broadcast kosong:
   - Fix: `winnerName = winnerUser?.name || winnerUser?.phone || 'anggota'` + tambah `phone` ke select query

CATATAN KONFIGURASI DEVICE:
- adb shell input text tidak bisa kirim teks multi-kata (autocomplete keyboard android memotong).
  Workaround: input kata satu per satu atau tap tombol langsung via koordinat uiautomator.
- Tab bar (custom RN component) tidak terdeteksi oleh uiautomator dengan bounds benar.
  Workaround: uiautomator dump dulu untuk dapat koordinat text label, lalu tap di y~2149.
- TypeScript: 0 errors setelah semua fix.

[FLOW-AUDIT-FIX · 2026-06-01 — Flow Audit + Bug Fixes (COMPLETE)]
Audit menyeluruh semua flow dari audit sebelumnya. Ditemukan 7 bug, semua diperbaiki. TypeScript: 0 errors.

BUG YANG DIPERBAIKI:
1. HomeScreen hero card: teks "jatuh tempo 2 hari lagi" hardcoded, tidak pernah update.
   - Fix: tampilkan nominal + total_periods saja (data tersedia dari Group list API).
   - Fix: urgentGroup sekarang hanya grup dengan status='active' (bukan groups[0] sembarang).
   - Fix: kondisi tambah — kalau tidak ada grup active, hero card tidak tampil sama sekali.
   - File: src/screens/home/HomeScreen.tsx

2. HomeScreen "Sudah bayar" button tidak punya onPress handler — tap tidak melakukan apapun.
   - Fix: navigate ke GroupDetail agar user bisa bayar dari sana (periodId tidak tersedia di list).
   - Label diubah ke "Bayar sekarang" yang lebih akurat.
   - File: src/screens/home/HomeScreen.tsx

3. DetailGrupScreen → RequestSwap: myPeriod null-default ke 1 jika slot_order belum diatur.
   - Masalah: `members.find(...)?.slot_order ?? 1` → kalau null, dikirim myPeriod=1 yang salah.
   - Fix: cek slot_order lebih dahulu; jika null → Alert "Hubungi ketua untuk atur giliran", tidak navigate.
   - File: src/screens/groups/DetailGrupScreen.tsx

4. RequestSwapScreen: setelah request sukses hanya goBack(), tidak navigate ke SwapStatus.
   - Masalah: user tidak bisa pantau progress swap setelah request.
   - Fix: navigation.replace('SwapStatus', { requestId: swap.id }) setelah request sukses.
   - File: src/screens/swaps/RequestSwapScreen.tsx

5. PaymentStatusScreen: member tanpa payment record tidak muncul di list.
   - Masalah: render dari payments[] saja; member yang belum punya record di DB tidak tampil.
   - Fix: build fullPayments dari groupData.members, merge dengan payment data → semua member tampil dengan status 'pending' sebagai default.
   - File: src/screens/payments/PaymentStatusScreen.tsx

6. DetailGrupScreen: keyboardType="numeric" di input tanggal YYYY-MM-DD tidak punya tombol "-".
   - Fix: ganti ke keyboardType="default".
   - File: src/screens/groups/DetailGrupScreen.tsx

7. DetailGrupScreen: setelah bubarkan grup, navigation.goBack() → GroupsScreen mungkin stale.
   - Fix: navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) → kembali ke HomeScreen bersih.
   - File: src/screens/groups/DetailGrupScreen.tsx

8. UndianScreen: polling `load()` tiap 3s trigger setLoadingData(true/false) → interval restart setiap poll.
   - Masalah: setiap cycle poll, loadingData berubah → effect cleanup → interval baru dibuat.
   - Fix: load() terima parameter showLoading=true; polling call load(false) → skip setLoadingData.
   - File: src/screens/undian/UndianScreen.tsx

[PROD-AUDIT · 2026-06-01 — Production Readiness Audit (COMPLETE)]
Audit menyeluruh semua alur: register → buat grup → undian → bayar → tukar → chat. TypeScript: 0 errors setelah semua fix.

BUGS DITEMUKAN & DIPERBAIKI:
1. groups.ts adaptMember: swap_count selalu hardcoded 0 → fix ke raw.jumlah_tukar ?? 0.
   - RequestSwapScreen/SwapByKetuaScreen sekarang bisa enforce limit 2x tukar per user.
   - Butuh backend pastikan jumlah_tukar ada di response GET /api/groups/:id members.

2. types.ts: Route BayarDone terdefinisi tapi tidak ada screen & tidak pernah dipakai → dihapus.

3. SwapStatusScreen.tsx: SELURUHNYA pakai data hardcoded (nama, tanggal, steps) → rewrite lengkap:
   - Fetch swap real via getMySwaps() + filter by requestId
   - Steps (4 langkah) dibangun dari swap.status actual
   - Rejected steps tampil icon X + warna merah
   - Pull-to-refresh, loading state, dan error state

4. .env: EXPO_PUBLIC_PRIVACY_POLICY_URL belum ada → ditambahkan.
   - OTPVerifyScreen: WA support number hardcoded 6281234567890 → pindah ke EXPO_PUBLIC_SUPPORT_WA
   - InviteScreen: Play Store URL hardcoded & pakai package ID lama → pindah ke EXPO_PUBLIC_PLAYSTORE_URL

5. HomeScreen bell badge: selalu tampil (hardcoded) → sekarang hanya tampil jika unread_count > 0.
   - Fetch getNotifications(token, 1) on mount untuk cek unread count.

MASIH PERLU DITINDAK DEVELOPER (bukan kode, tapi konfigurasi):
- EXPO_PUBLIC_API_URL=localhost:3001 tidak akan bisa di device fisik. Ganti ke IP LAN sebelum test device.
- EXPO_PUBLIC_PRIVACY_POLICY_URL: isi URL kebijakan privasi asli sebelum publish.
- EXPO_PUBLIC_SUPPORT_WA: isi nomor WA support asli.
- google-services.json: isi dengan file asli dari Firebase Console (sekarang masih template).
- Play Store URL baru aktif setelah app dipublish ke Google Play.

[MO-13 (Backend) · 2026-06-01 — Backend Changes untuk Undian Flow]
- TIDAK ada migration baru — pendekatan akhir pakai status string 'ketua_pending' di kolom status VARCHAR yang sudah ada (tidak perlu kolom baru). DB verified: 'ketua_pending' diterima tanpa error.
- arisan-api/src/routes/groups.ts: PUT /:groupId/periods/:periodId/tanggal sekarang mengizinkan pemenang undian (bukan hanya ketua) set tanggal_pelaksanaan, HANYA jika tanggal belum diisi. Ketua bisa override kapan saja. Check via SELECT dari tabel winners (period_id + user_id).
- arisan-api/src/routes/swaps.ts: tambah POST /api/swaps/ketua — ketua pilih member_a_id dan member_b_id untuk ditukar. Di-register SEBELUM POST / agar tidak tertangkap. Import gs dari services/groups untuk logActivity.
- arisan-api/src/services/swaps.ts: (1) respondSwap — handle status 'ketua_pending': jika target accepts → auto-approve langsung (skip waiting_ketua), execute swap urutan, notify. Normal 'pending' tetap ke waiting_ketua. (2) createKetuaSwapRequest — insert dengan status: 'ketua_pending', validasi kedua anggota, cek tidak ada active swap antar keduanya.
- mobile/src/api/swaps.ts: Swap.status tambah 'ketua_pending'. requestAsKetua() pakai field member_a_id/member_b_id.
- mobile/src/screens/swaps/SwapInboxScreen.tsx: filter incoming swaps sekarang include 'ketua_pending'. Badge "Dari Ketua" muncul pada ketua-initiated swaps.
- TypeScript: 0 errors backend + mobile.

[MO-13 · 2026-06-01 — Undian Flow Fix: All 3 Modes (COMPLETE)]
- UndianScreen.tsx: Major refactor — 3 mode undian sekarang punya flow yang benar.
  - Mode 1 (fixed): undian hanya bisa dilakukan SATU KALI per periode. Setelah ada winner untuk periodNumber, tampil "Undian sudah selesai" view + tombol Mulai Undian hilang.
  - Mode 2 (random): sama dengan Mode 1 + polling live untuk anggota (setInterval 3 detik) — "Menunggu ketua memulai undian..." pill muncul untuk anggota. Henti poll otomatis setelah winner terdeteksi.
  - Mode 3 (manual): UI sekarang drag-drop semua anggota (DraggableFlatList) → "Simpan Urutan Pemenang" → calls setSlotOrder() → locked view "Urutan sudah dikunci". Sebelumnya broken (UI sama dengan Mode 2, winner_id tidak dikirim ke backend).
- UndianScreen.tsx: broadcast ke chat grup (fire-and-forget sendMessage) setelah undian selesai (Mode 1/2) dan setelah simpan urutan (Mode 3).
- DetailGrupScreen.tsx: undian button sekarang disabled setelah undian dilakukan (currentPeriodUndianDone) atau setelah Mode 3 order disimpan (allHaveSlotOrder).
- DetailGrupScreen.tsx: Tukar button disabled sampai ada pemenang pertama (hasAnyWinner) atau Mode 3 order tersimpan (allHaveSlotOrder). Alert jika diklik sebelum waktunya.
- DetailGrupScreen.tsx: Mode 2 — hint kuning muncul jika undian belum bisa karena periode sebelumnya belum closed atau tanggal pelaksanaan belum tiba.
- DetailGrupScreen.tsx: Mode 2 — prompt khusus untuk pemenang (isWinner) agar set tanggal arisan setelah menang. Pemenang bisa buka modal setTanggalPelaksanaan langsung dari banner. (Backend: perlu allow non-ketua set tanggal).
- DetailGrupScreen.tsx: Mode 2 + isKetua — tombol "Tukar Giliran (Ketua)" di ketua actions → SwapByKetuaScreen. Tampil hanya setelah ada pemenang pertama.
- DetailGrupScreen.tsx: state baru: hasAnyWinner, currentPeriodUndianDone, currentWinnerId, currentExecutionDate, prevPeriodClosed, allHaveSlotOrder, undianMode2Blocked.
- payments.ts: Period interface + RawPeriod tambah execution_date / tanggal_pelaksanaan field.
- InviteScreen.tsx: tambah polling drawMode, currentPeriodId, groupActive. Saat grup jadi active + Mode 2 → banner "Grup siap! Mulai Undian Pertama" dengan tombol navigasi ke UndianPre.
- swaps.ts: tambah requestAsKetua() → POST /api/swaps/ketua (backend belum ada, perlu diimplementasikan di arisan-api).
- SwapByKetuaScreen.tsx: screen baru — ketua pilih 2 anggota untuk ditukar giliran. Pre-fill Anggota A dengan pemenang undian jika ada.
- navigation/types.ts: tambah SwapByKetua route.
- AppNavigator.tsx: register SwapByKetuaScreen.
- TypeScript: 0 errors. Tidak ada dependency baru.
- Backend changes dibutuhkan:
  1. setTanggalPelaksanaan: allow non-ketua (pemenang) set tanggal_pelaksanaan periode.
  2. POST /api/swaps/ketua: endpoint baru untuk ketua inisiatif swap antar dua anggota.

[MO-12 · 2026-06-01 — Gap Resolution PRD v1.3 (COMPLETE)]
- OTPVerifyScreen: failCount state — support link WA hanya muncul setelah ≥3× gagal.
- groups.ts + RequestSwapScreen: swap_count / jumlah_tukar — UI tampilkan sisa batas tukar + disable jika limit tercapai.
- Backend arisan-api GET /api/groups/:id: tambah jumlah_tukar ke query group_members.
- Backend POST /api/groups/:groupId/messages: fire-and-forget Expo push notif ke semua anggota lain saat pesan baru.
- Backend GET+POST /api/groups/:groupId/typing: endpoint typing indicator in-memory TTL 5 detik.
- ChatScreen: poll getTyping tiap 3 detik + debounce sendTyping 500ms + tampilkan "[Nama] sedang mengetik..." di atas input.
- Firebase Crashlytics: @react-native-firebase/app + crashlytics terinstall. app.json googleServicesFile dikonfigurasi. google-services.json template dibuat. App.tsx init via try/require (aman sebelum prebuild). Developer perlu download google-services.json asli dari Firebase Console.
- Cron notifikasi: GitHub Actions cron-notif.yml sudah ada di arisan-api (08:00 WIB, payment + pelaksanaan reminder).
- GAP-REPORT-PRD-v1.3.md: status ~98%. Satu langkah manual tersisa: isi google-services.json asli.
- TypeScript: 0 errors mobile + backend. Dependencies baru: @react-native-firebase/app, @react-native-firebase/crashlytics.

[DESIGN-SYNC · 2026-05-31]
- Audit menyeluruh semua 20+ screen vs design files di .claude/designs/. Mayoritas sudah match.
- DetailGrupScreen: FIXED — status hero card sekarang menampilkan winner name (dari undianApi.getHistory), due date aktual (dari getPeriods), dan progress bar paidCount/memberCount aktual. Member grid sekarang menampilkan payment status nyata (lunas/belum/terlambat) dari getPayments — sebelumnya selalu hardcoded "belum".
- UndianResultScreen: FIXED — tambah section "Daftar pemenang" yang menampilkan list winner per periode (dari undianApi.getHistory), dengan highlight untuk periode current. Sebelumnya hanya ada winner spotlight tanpa list.
- GroupsScreen: FIXED — sekarang fetch getGroupDetail() in parallel untuk semua grup agar bisa tampilkan member count aktual, current period, dan role-based filtering (Ketua vs Anggota). Sebelumnya member=0 dan periode=hardcoded.
- InviteScreen: FIXED — sekarang poll getGroupDetail() setiap 5 detik untuk update member list secara realtime saat anggota bergabung. Sebelumnya hanya show placeholder "Kamu · Ketua" hardcoded.
- TypeScript: 0 errors. Tidak ada dependency baru.

[DESIGN-IMPL · 2026-05-31]
- Design bundle dari claude.ai/design didownload, diekstrak, dan disimpan ke .claude/designs/ (hifi-*.jsx + colors_and_type.css).
- Audit semua 26 screens: semua sudah terimplementasi dari sesi MO-0 s/d MO-10. Design system (colors/typography/spacing) sudah match token dari CSS bundle.
- SplashScreen: hapus tombol "Sudah punya akun" → single "Mulai" button sesuai design V2.
- HomeScreen hero: tombol "Sudah bayar" diubah dari solid primaryDeep ke ghost style (white border, transparent bg) sesuai design.
- NotificationsScreen: tambah CTA_MAP per notification type + Btn per unread item (Bayar/Lihat/Tinjau). First unread = primary variant, sisanya = soft.
- expo-linear-gradient TIDAK diinstall (perlu konfirmasi). Hero card pakai solid Colors.primary sementara.
- TypeScript: 0 errors. Tidak ada dependency baru.

[AUDIT-GAP · 2026-05-30]
- swaps.ts: tambah 'waiting_ketua' ke Swap.status union — backend set status ini saat target menerima, bukan 'target_accepted'.
- SwapApprovalScreen: filter diubah dari s.status === 'target_accepted' ke s.status === 'waiting_ketua' — sebelumnya approval screen SELALU kosong karena status tidak pernah match.
- groups.ts: leaveGroup() method diubah dari POST ke DELETE — backend hanya punya DELETE /:id/leave, POST 405.
- payments.ts: Period.status diubah dari 'open'|'closed' ke 'upcoming'|'active'|'closed'. adaptPeriod sekarang preserve 'upcoming' dan 'active' as-is, hanya map 'completed' → 'closed'. Sebelumnya 'upcoming' dan 'active' keduanya jadi 'open' dan tidak bisa dibedakan.
- PaymentHistoryScreen: label Pill diupdate — 'closed' = Selesai (mint), 'active' = Aktif (amber), 'upcoming' = Mendatang (neutral).

[MO-10 · 2026-05-30]
- chat.ts: ganti REST polling dengan Supabase Realtime. fetchMessages() pakai Supabase JS langsung (dengan JOIN users), subscribeMessages() subscribe postgres_changes INSERT filtered by group_id. sendMessage() tetap REST POST.
- ChatScreen: hapus POLL_INTERVAL, subscribe realtime di useEffect, dedupe optimistic update dengan id check. userNameCache (useRef) diisi dari initial load dan dipakai untuk memperkaya pesan realtime (yang tidak ada JOIN-nya).
- ChatMessage.type: harus 'user' | 'system' (bukan literal 'user') agar filter 'Sistem' di screen tidak error TypeScript.
- Realtime mobile pakai anon key — auth.uid() tidak berfungsi karena JWT kustom tidak punya sub claim. messages table tidak punya RLS (sengaja untuk MVP).
- notifications.ts: interface berubah is_read: boolean (bukan read_at), response dibungkus { notifications, unread_count, has_more }. markAllRead PATCH (bukan POST). Tambah markRead() per item.
- NotificationsScreen: sesuaikan is_read, tambah pull-to-refresh, loading state, error state, tap item → markRead.
- groups.ts: tambah setTanggalPelaksanaan().
- DetailGrupScreen: tombol "Atur Tanggal" hanya muncul jika isKetua && status === 'active' && current_period_id ada. Modal dengan TextInput + validasi /^\d{4}-\d{2}-\d{2}$/.
- auth.ts: tambah deleteAccount() → DELETE /api/users/me.
- ProfileScreen: tombol "Hapus Akun" (subtle, warna muted) di bawah Logout. Konfirmasi 2 langkah via Alert.alert bertingkat (bukan Alert.prompt — tidak cross-platform). useAuth harus expose token.
- Icon.tsx: tambah trash icon (Lucide path).

[MO-09 · 2026-05-30]
Audit gap fixes — 28 dari 34 gap diselesaikan (sprint 1-3). GAP-026 (chat tabel+endpoint) dan GAP-028 (notifikasi inbox design) ditunda karena butuh desain arsitektur baru.

MOBILE FIXES:
- auth.ts: GAP-001 unwrap { user }, GAP-002 return type updateMe, GAP-003 expo_push_token field name, hapus push_token dari UserProfile
- groups.ts: GAP-004 unwrap { groups }, GAP-005+034 adaptGroup+adaptMember remap field names (ketua_id→created_by, frekuensi→frequency, jumlah_periode→total_periods, mode_undian→draw_mode, urutan→slot_order, users→user), GAP-006 createGroup payload remap, GAP-011 setSlotOrder URL /urutan + field urutan, GAP-033 tambah 'disbanded' ke status
- payments.ts: GAP-013+014 fix URL prefix ke /api/payments/, GAP-015 unwrap { payments }, GAP-016 adaptPeriod (periode_ke→period_number, jatuh_tempo→due_date, status mapping), GAP-017 hapus group_id dari Payment
- undian.ts: GAP-019+020 adaptWinner (created_at→drawn_at, periods.periode_ke→period_number, users.name→winner_name)
- swaps.ts: GAP-022 unwrap { swap } dari POST /swaps, GAP-023 respond return type { status }, GAP-024 requester_period+target_period jadi optional
- usePaymentRealtime.ts: GAP-018 preserve user field saat realtime update
- BuatGrupStep3Screen: GAP-007 'offline' → 'manual'
- DetailGrupScreen: GAP-021 pass current_period_id (real UUID) ke UndianPre dan Bayar navigation
- RequestSwapScreen: fix key={m.user_id} (id dihapus dari GroupMember)
- SwapApprovalScreen, SwapInboxScreen: graceful fallback untuk requester_period/target_period undefined

BACKEND FIXES (di arisan-api):
- groups: GET /code/:code (GAP-009), POST /:id/invite (GAP-010), GET /:id/periods (GAP-012), GET /:id/activity-log dengan action→icon+tone mapping (GAP-027+029)
- groups: current_period_id + current_period di GET /:id response (GAP-008), user_id disertakan di member query
- undian: GET /:id/winners dengan JOIN periods+users (GAP-019)
- swaps: JOIN users!requester_id + users!target_id di GET /my dan GET /group/:id (GAP-025)

TIDAK DIIMPLEMENTASIKAN (butuh desain ulang):
- GAP-026: chat messages — butuh tabel baru + endpoint (desain REST vs realtime)
- GAP-028: notifications inbox — butuh tabel baru (bukan notif_log yang ada)
- GAP-030, 031, 032: medium/low priority, ditunda ke sprint berikutnya

TypeScript: 0 errors. Tidak ada dependency baru.

[MO-8 · 2026-05-30]
- SplashScreen: teks consent "Dengan melanjutkan, kamu setuju dengan Kebijakan Privasi kami" + link tap → Linking.openURL(PRIVACY_POLICY_URL) di bawah CTA buttons
- ProfileScreen: menu item "Kebijakan Privasi" di akhir MENU array, tap → Linking.openURL(PRIVACY_POLICY_URL)
- Icon.tsx: fileText ditambahkan (Lucide file-text path)
- EXPO_PUBLIC_PRIVACY_POLICY_URL ditambahkan ke .env.example (isi URL sebelum build)
- E2E test, performance test, build, upload, dan monitoring = tugas manual/operational developer, bukan kode
- TypeScript: 0 errors. Tidak ada dependency baru.

[MO-7 · 2026-05-30]
- OfflineBanner: animasi slide-down (muncul) dan slide-up (hilang) saat status jaringan berubah, pakai Animated.parallel (translateY + opacity)
- HomeScreen: lastUpdated state, stale label "Data terakhir diperbarui: [waktu]" saat offline, tooltip "Butuh koneksi internet" di bawah CTA buttons
- DetailGrupScreen: refactor load() ke useCallback([token, groupId, isOnline]) agar auto-refresh saat kembali online, tambah loading state + skeleton (identity/status card/quick actions/member grid), stale label, tooltip offline, perbaiki cache key dari raw string ke CACHE_KEYS.groupDetail(groupId)
- PaymentStatusScreen: ganti ActivityIndicator dengan skeleton rows (due date + progress bar + 4 member rows)
- TypeScript: 0 errors. Tidak ada dependency baru.

[MO-6 · 2026-05-30]
- src/api/chat.ts dibuat: ChatMessage, ActivityLogEntry types + getMessages, sendMessage, getActivityLog
- navigation/types.ts: ketuaId ditambahkan ke Chat route params
- DetailGrupScreen: pass group.created_by sebagai ketuaId saat navigate ke Chat
- ChatScreen: mock dihapus, ganti dengan real API + polling 4 detik, FlatList inverted, skeleton 5 bubble, badge "Ketua" dari ketuaId, error/offline state, input disabled saat offline
- ActivityLogScreen: MOCK_ACTIVITIES dihapus, ganti dengan API real, infinite scroll, formatTimestamp lokal ("12 Jun 2026 · 14:30"), loading/error/empty state
- UndianResultScreen: fix navigate Chat dengan ketuaId kosong (tidak ada akses created_by di sini)
- stream-chat-expo TIDAK diinstall (keputusan developer) — typing indicator dilewat (butuh WebSocket)
- TypeScript: 0 errors. Tidak ada dependency baru.

[MO-5 · 2026-05-30]
- src/api/swaps.ts dibuat: Swap type + swapsApi (request, respond, approve, getMySwaps, getGroupSwaps)
- RequestSwapScreen: mock SLOTS dihapus, diganti load real members via getGroupDetail, identifikasi user by user_id, disable past/current slots, error via Alert.alert Bahasa Indonesia
- SwapInboxScreen: baru, list swap masuk (target_id === user.id, status pending), Terima/Tolak inline + Alert konfirmasi, pull-to-refresh, empty state, loading, error state
- SwapApprovalScreen: baru (ketua only by navigation), list swap status target_accepted per group, Setujui (approved) / Tolak (ketua_rejected) dengan Alert konfirmasi, pull-to-refresh, loading, error state
- navigation/types.ts: tambah SwapInbox (undefined) dan SwapApproval ({ groupId, groupName })
- AppNavigator.tsx: registrasi SwapInboxScreen dan SwapApprovalScreen
- Semua aksi disabled saat offline dengan tooltip Bahasa Indonesia
- TypeScript: 0 errors. Tidak ada dependency baru.

[MO-4 · 2026-05-30]
- src/api/undian.ts dibuat: undianApi.start() POST /undian, undianApi.getHistory() GET /winners
- UndianScreen: candidates real dari API (getGroupDetail + getHistory, filter belum menang)
- UndianScreen: isKetua dari route param → button "Mulai Undian" hidden untuk anggota biasa
- RiwayatPemenangScreen: baru, read-only list per periode, empty state, pull-to-refresh
- UndianResultScreen: hapus MOCK_WINNERS, tambah tombol navigasi ke RiwayatPemenang
- UndianError dihapus dari types (tidak ada screen), error inline via Alert.alert
- navigation/types.ts: isKetua di UndianPre, periodeKe di UndianResult, RiwayatPemenang route baru
- DetailGrupScreen: pass isKetua + current_period saat navigate ke UndianPre
- TypeScript: 0 errors. Tidak ada dependency baru.

[MO-0 · 2026-05-30]
- Expo SDK 52 scaffold selesai (manual setup karena folder sudah berisi docs)
- Design system dari Arisan Hi-Fi.html diimplementasikan: colors.ts, typography.ts, spacing.ts
- Font: SpaceGrotesk (600) + PlusJakartaSans via @expo-google-fonts
- Custom Icon component dengan ICON_PATHS (Lucide-style stroke, react-native-svg)
- 19 screens total: Auth (4), Home/Groups/Notif/Profile (4+1), Group (DetailGrup, BuatGrup 3-step, Invite, JoinGrup, JoinConfirm), Payments, Undian (2), Swap (2), Chat, ActivityLog
- Navigation: Tab (Beranda/Grup/Notifikasi/Profil) + Stack untuk semua sub-screens
- repo: https://github.com/ruhaparelstudio-star/arisan-mobile.git
- Belum: verifikasi di device fisik, npm install

[MO-3 · 2026-05-30]
- usePaymentRealtime direfactor: filter period_id (bukan group_id), terima initial: Payment[], return state
- PaymentStatusScreen: title "Status Bayar — Periode [N]", progress bar, jatuh tempo (merah jika lewat),
  badge "Live", list semua anggota dengan status (Lunas/Belum/Terlambat), tap→modal konfirmasi/batal (ketua only),
  OfflineBanner, cache AsyncStorage, label "Data terakhir diperbarui" saat offline
- PaymentHistoryScreen: accordion per periode (sort terbaru dulu), lazy-fetch payments per periode saat expand,
  per-member status badge
- payments.ts: confirmPayments (array) → confirmPayment (single) + cancelConfirm (single DELETE)
- Icon.tsx: chevronUp ditambahkan
- TypeScript: 0 errors. Tidak ada dependency baru.
- Realtime belum ditest 2 device (butuh Supabase aktif + 2 device fisik)
```
