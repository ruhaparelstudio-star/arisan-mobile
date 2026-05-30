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
