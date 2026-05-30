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
[MO-0 · 2026-05-30]
- Expo SDK 52 scaffold selesai (manual setup karena folder sudah berisi docs)
- Design system dari Arisan Hi-Fi.html diimplementasikan: colors.ts, typography.ts, spacing.ts
- Font: SpaceGrotesk (600) + PlusJakartaSans via @expo-google-fonts
- Custom Icon component dengan ICON_PATHS (Lucide-style stroke, react-native-svg)
- 19 screens total: Auth (4), Home/Groups/Notif/Profile (4+1), Group (DetailGrup, BuatGrup 3-step, Invite, JoinGrup, JoinConfirm), Payments, Undian (2), Swap (2), Chat, ActivityLog
- Navigation: Tab (Beranda/Grup/Notifikasi/Profil) + Stack untuk semua sub-screens
- repo: https://github.com/ruhaparelstudio-star/arisan-mobile.git
- Belum: verifikasi di device fisik, npm install
```
