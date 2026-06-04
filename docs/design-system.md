# Design System

All tokens live in `src/theme/`. Import from there — never hard-code hex values or font names in screen files.

---

## Colors (`src/theme/colors.ts`)

### Primary palette

| Token | Value | Use |
|-------|-------|-----|
| `Colors.primary` | `#00C897` | Buttons, active borders, icons, badges |
| `Colors.primaryDeep` | `#00A87E` | Pressed state, strong emphasis |
| `Colors.primaryInk` | `#047857` | Text on light primary tint |
| `Colors.primaryTint` | `#E6FAF4` | Badge backgrounds, soft section fills |
| `Colors.primaryRing` | `rgba(0,200,151,0.18)` | Focus rings |
| `Colors.primaryShadow` | `rgba(0,168,126,0.55)` | Primary button drop shadow |

### Neutrals

| Token | Value | Use |
|-------|-------|-----|
| `Colors.bg` | `#FFFFFF` | Screen backgrounds |
| `Colors.card` | `#FFFFFF` | Card surfaces |
| `Colors.surface` | `#F4F6F5` | Secondary surfaces, skeleton bars |
| `Colors.border` | `#ECEFEE` | Default borders, dividers |
| `Colors.borderStrong` | `#DDE3E1` | Input borders, strong dividers |
| `Colors.ink` | `#0E1B16` | Primary text |
| `Colors.muted` | `#7A8B84` | Secondary text, hints |
| `Colors.mutedStrong` | `#566159` | Medium-weight secondary text |

### Semantic

| Token | Value | Use |
|-------|-------|-----|
| `Colors.amber` | `#F5A524` | Warning, active status dot |
| `Colors.amberTint` | `#FFF4E0` | Warning background |
| `Colors.amberInk` | `#B57400` | Warning text |
| `Colors.danger` | `#EF5B52` | Error, offline banner, destructive |
| `Colors.dangerTint` | `#FEECEB` | Error background |
| `Colors.success` | `#00C897` | Alias for primary (confirmed payment) |

### Avatar color pairs (`AvatarColors`)

Eight `[bg, fg]` pairs assigned deterministically from `name.charCodeAt(0) % 8` via `getAvatarColor(name)`.

---

## Typography (`src/theme/typography.ts`)

Two font families:

- **Space Grotesk** — display weights (400/500/600/700) via `Fonts.display*`
- **Plus Jakarta Sans** — body weights (400/500/600/700) via `Fonts.body*`

### Type scale

| Token | Family | Size | Line-height | Letter-spacing | Use |
|-------|--------|------|-------------|----------------|-----|
| `displayXL` | SG SemiBold | 32 | 35 | −0.8 | Hero numbers |
| `displayLG` | SG SemiBold | 28 | 31 | −0.5 | Large headings |
| `h1` | SG SemiBold | 26 | 29 | −0.5 | Page titles |
| `h2` | SG SemiBold | 22 | 25 | −0.4 | Section headings |
| `h3` | SG SemiBold | 18 | 22 | −0.3 | Card headings |
| `title` | SG SemiBold | 16 | 20 | — | List row titles |
| `body` | PJS Regular | 15 | 22 | — | Body copy |
| `bodyStrong` | PJS SemiBold | 15 | 22 | — | Bold body copy |
| `bodySm` | PJS Regular | 13 | 19 | — | Secondary labels |
| `caption` | PJS Medium | 12 | 17 | — | Captions, tooltips |
| `label` | PJS Bold | 12 | — | +0.3 | Status labels |
| `overline` | PJS Bold | 10.5 | — | +0.6 | Uppercase micro-labels |
| `num` | SG SemiBold | — | — | — | Numeric displays |

---

## Spacing, Radius, Shadow (`src/theme/spacing.ts`)

### Spacing scale

| Token | px | Use |
|-------|----|-----|
| `sp1` | 4 | Tight gap |
| `sp2` | 8 | Small gap |
| `sp3` | 12 | Default gap |
| `sp4` | 16 | Standard padding |
| `sp5` | 22 | Screen padding (`screenPad`) |
| `sp6` | 28 | Large gap |
| `sp7` | 40 | XL gap |

Screen horizontal padding: `screenPad = 22`.

### Border radius

| Token | px | Use |
|-------|----|-----|
| `sm` | 8 | Chips, small elements |
| `md` | 12 | Cards |
| `input` | 14 | Input fields |
| `btn` | 15 | Buttons |
| `card` | 20 | Large cards |
| `pill` | 999 | Pills, avatars |

### Shadows

| Token | Use |
|-------|-----|
| `Shadow.card` | Standard card elevation (elevation 2) |
| `Shadow.primary` | Primary button glow (elevation 6, green tint) |
| `Shadow.pop` | Modal/drawer pop (elevation 12) |

---

## UI Components (`src/components/ui/`)

### `Btn` (Button.tsx)

```tsx
<Btn
  variant="primary" | "dark" | "soft" | "outline" | "ghost"
  size="sm" | "md" | "lg"
  icon="iconName"         // optional left icon
  iconRight="iconName"    // optional right icon
  full                    // width: 100%
  loading                 // shows ActivityIndicator
  disabled                // opacity 0.45, non-interactive
  onPress={fn}
>
  Label
</Btn>
```

| Variant | Background | Foreground | Border |
|---------|-----------|-----------|--------|
| `primary` | `Colors.primary` | white | none (green drop shadow) |
| `dark` | `Colors.ink` | white | none |
| `soft` | `Colors.primaryTint` | `Colors.primaryInk` | none |
| `outline` | transparent | `Colors.ink` | `Colors.borderStrong` |
| `ghost` | transparent | `Colors.primaryInk` | none |

Size dimensions: sm `(8,14)`, md `(13,20)`, lg `(16,22)` padding-V/H.

---

### `Icon` (Icon.tsx)

Renders SVG via `react-native-svg` from an inline registry of Lucide-style paths.

```tsx
<Icon name="bell" size={22} color={Colors.ink} strokeWidth={1.8} />
```

Available icon names: `home`, `users`, `activity`, `user`, `bell`, `chevronRight`, `chevronLeft`, `chevronDown`, `chevronUp`, `plus`, `check`, `checkCircle`, `swap`, `sparkles`, `wallet`, `share`, `copy`, `lock`, `bank`, `arrowRight`, `arrowUp`, `arrowDown`, `x`, `search`, `qr`, `send`, `filter`, `calendar`, `clock`, `shield`, `trophy`, `settings`, `logout`, `message`, `info`, `alert`, `grip`, `dollar`, `edit`, `fileText`, `trash`.

To add an icon: append its SVG path string to `ICON_PATHS` in `Icon.tsx`.

---

### `Card` (Card.tsx)

Padded rounded white card with `Shadow.card` elevation. Accepts a `pad` prop (default 16).

### `Pill` (Pill.tsx)

Status badge with four tones: `mint` (green), `amber` (yellow), `neutral` (grey), `blue`. Optionally shows an animated pulse dot.

### `AppBar` (AppBar.tsx)

Screen header with optional `large` title mode, `back` button, and `right` slot.

### `Field` (Field.tsx)

Labeled `TextInput` with animated `borderColor` focus transition (`Colors.borderStrong` → `Colors.primary`).

### `OtpBoxes` (OtpBoxes.tsx)

6-cell OTP input — auto-advances focus on each character, supports paste.

### `SkeletonBar` (SkeletonBar.tsx)

Animated shimmer placeholder bar. Accepts `width`, `height`, `borderRadius`.

### `StateView` (StateView.tsx)

Full-screen empty/error state with icon, heading, body text, and optional retry `Btn`.

### `Avatar` (Avatar.tsx)

Initials avatar using `getAvatarColor(name)` for deterministic background/foreground pair.

### `ListRow` (ListRow.tsx)

Horizontal row with `leading` slot, `title`, `sub`, and `right` slot. Draws a bottom divider unless `lastChild`.

### `Segmented` (Segmented.tsx)

Horizontal tab control for filtering (e.g. "Semua / Ketua / Anggota").

### `SectionLabel` (SectionLabel.tsx)

Bold section heading with optional `right` slot (typically a "Lihat semua" link).

---

## Offline banner (`src/components/OfflineBanner.tsx`)

Rendered immediately below the `AppBar` on screens that require real-time data. Animates slide-down on disconnect and slide-up on reconnect using `Animated.parallel` on `translateY` and `opacity`. Height: 36 px, background `Colors.danger`, white text.

Required on: HomeScreen, DetailGrupScreen, PaymentStatusScreen, ChatScreen.

---

## Required states for every screen

All screens must handle these four states without blank fallbacks:

| State | Implementation |
|-------|---------------|
| **Loading** | `SkeletonBar` rows or `ActivityIndicator` |
| **Error** | `StateView` with Bahasa Indonesia message + "Coba Lagi" button |
| **Empty** | Descriptive text + CTA button |
| **Offline** | `OfflineBanner` + cached data + critical actions disabled with tooltip "Butuh koneksi internet untuk melakukan aksi ini" |
