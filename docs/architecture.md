# Architecture

## Technology stack

| Layer | Library / tool |
|-------|---------------|
| Framework | React Native + Expo SDK 52 |
| Language | TypeScript 5 |
| Navigation | React Navigation 6 (native-stack + bottom-tabs) |
| Auth state | React Context (`AuthContext`) + `expo-secure-store` |
| HTTP | Custom `apiCall` wrapper around `fetch` with 15 s timeout |
| Realtime | Supabase Realtime (payments, chat messages) |
| Offline cache | `AsyncStorage` with 24-hour TTL (`src/utils/cache.ts`) |
| Push notifications | `expo-notifications` + Expo push service |
| Audio | `expo-av` — notification sound on foreground push |
| Crash reporting | Firebase Crashlytics (`@react-native-firebase/crashlytics`) |
| Drag-and-drop | `react-native-draggable-flatlist` (undian mode 3 slot ordering) |
| SVG icons | `react-native-svg` with inline Lucide paths (`Icon.tsx`) |
| Fonts | Space Grotesk (display) + Plus Jakarta Sans (body) via `@expo-google-fonts` |
| Build | EAS Build (cloud), `npx expo run:android --device` for local dev |

## Folder structure

```
mobile/
├── App.tsx                  # Root: fonts, audio mode, Crashlytics, notification handler
├── app.config.js            # Expo config (env-aware, EAS project ID)
├── src/
│   ├── api/                 # One file per domain — all HTTP calls go through client.ts
│   │   ├── client.ts        # apiCall<T>() — base fetch, auth header, timeout, error
│   │   ├── auth.ts          # OTP login, user profile, push token, account deletion
│   │   ├── groups.ts        # Groups CRUD, members, periods, Buku Arisan, Hutang, Kabur
│   │   ├── payments.ts      # Period list, payment list, confirm/cancel payment
│   │   ├── undian.ts        # Start lottery, get winner history
│   │   ├── swaps.ts         # Request, respond, approve, ketua-initiated swap
│   │   ├── chat.ts          # Supabase-direct fetch + realtime subscribe + REST send
│   │   └── notifications.ts # Get inbox, mark read, mark all read
│   ├── components/
│   │   ├── OfflineBanner.tsx          # Animated slide-in/out red bar at top of screen
│   │   ├── GrupCard.tsx               # Group summary card for GroupsScreen
│   │   ├── AnggotaItem.tsx            # Member row with avatar + swap count
│   │   └── ui/                        # Design-system primitives
│   │       ├── AppBar.tsx             # Header with optional large title and right slot
│   │       ├── Avatar.tsx             # Initials-based colored avatar
│   │       ├── Button.tsx             # Btn — 5 variants × 3 sizes + icon + loading
│   │       ├── Card.tsx               # Padded rounded surface
│   │       ├── Field.tsx              # Labeled text input with focus border
│   │       ├── Icon.tsx               # SVG icon from inline Lucide path registry
│   │       ├── ListRow.tsx            # Leading/title/sub/right row with divider
│   │       ├── LoadingView.tsx        # Full-screen centered spinner
│   │       ├── OtpBoxes.tsx           # 6-box OTP input
│   │       ├── Pill.tsx               # Status badge (mint/amber/neutral/blue)
│   │       ├── SectionLabel.tsx       # Bold section header with optional right slot
│   │       ├── Segmented.tsx          # Tab segment control
│   │       ├── SkeletonBar.tsx        # Animated loading placeholder bar
│   │       └── StateView.tsx          # Error/empty state with retry CTA
│   ├── context/
│   │   └── AuthContext.tsx            # Token + user state, login/logout/updateUser
│   ├── hooks/
│   │   ├── useAuth.ts                 # Re-export from AuthContext
│   │   ├── useNetworkStatus.ts        # NetInfo → boolean isOnline
│   │   ├── usePaymentRealtime.ts      # Supabase Realtime for payments table
│   │   └── useChatSound.ts            # expo-av notification sound player
│   ├── navigation/
│   │   ├── types.ts                   # AuthStackParamList, MainTabParamList, AppStackParamList
│   │   ├── RootNavigator.tsx          # Auth gate: loading → AuthNavigator or AppNavigator
│   │   ├── AuthNavigator.tsx          # Splash → PhoneInput → OTPVerify → LoginSuccess
│   │   └── AppNavigator.tsx           # Bottom tabs + full screen stack (30+ routes)
│   ├── screens/                       # See screens.md for full inventory
│   ├── theme/
│   │   ├── colors.ts                  # Colors, AvatarColors, getAvatarColor()
│   │   ├── typography.ts              # Fonts, Typography scale
│   │   ├── spacing.ts                 # Spacing, Radius, Shadow
│   │   └── index.ts                   # Re-exports
│   └── utils/
│       ├── cache.ts                   # AsyncStorage + 24-hour TTL wrapper + CACHE_KEYS
│       └── storage.ts                 # SecureStore wrapper for JWT token + user object
├── assets/
│   └── sounds/notification.wav       # Push notification audio
└── docs/                             # This documentation suite
```

## App boot sequence

```
App.tsx
  ├─ SplashScreen.preventAutoHideAsync()
  ├─ Try-catch: init Firebase Crashlytics + global error handler
  ├─ Notifications.setNotificationHandler() — show alert + set badge, play sound manually
  ├─ Load notification.wav sound via expo-av
  ├─ useFonts([SpaceGrotesk, PlusJakartaSans])
  └─ onLayout → SplashScreen.hideAsync()

RootNavigator
  └─ AuthContext.isLoading?
       ├─ true  → spinner
       ├─ token → AppNavigator (authenticated)
       └─ null  → AuthNavigator (unauthenticated)

AuthContext (on mount)
  ├─ SecureStore.get(token + user)
  ├─ if found → GET /api/users/me to validate
  │    ├─ 401/403 → clear storage (force re-login)
  │    └─ network error / timeout → keep session (offline-safe)
  └─ setIsLoading(false)
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL (e.g. `http://192.168.x.x:3001`) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_STREAM_API_KEY` | (unused in current build — Stream.io replaced by Supabase) |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | URL opened from Settings / Splash consent |
| `EXPO_PUBLIC_SUPPORT_WA` | WhatsApp support number (OTP failure help) |
| `EXPO_PUBLIC_PLAYSTORE_URL` | Play Store listing URL (InviteScreen share) |
| `GOOGLE_SERVICES_JSON` | Path to `google-services.json` for EAS Cloud builds |

Loaded from `.env.development` or `.env.production` based on `APP_ENV` env var (via `dotenv` in `app.config.js`).

## Security constraints

- **JWT stored in `expo-secure-store`** — never in AsyncStorage.
- **AsyncStorage** holds only non-sensitive cached data (group lists, payment lists) with TTL.
- All API calls go through `src/api/client.ts` — no bare `fetch` in screen code.
- Supabase is accessed directly from mobile only for: realtime subscriptions (no RLS in MVP) and chat message reads (anon key, no JWT mapping).
