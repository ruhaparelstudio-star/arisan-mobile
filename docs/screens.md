# Screens

Full inventory of all 30+ screens. Organised by feature domain.

---

## Auth flow

### `SplashScreen`
**Route:** `Splash` (AuthStack)  
**Purpose:** Brand landing with privacy consent.  
**Features:** Single "Mulai" CTA; consent text with `Linking.openURL(EXPO_PUBLIC_PRIVACY_POLICY_URL)`.  
**Navigates to:** `PhoneInput`.

---

### `PhoneInputScreen`
**Route:** `PhoneInput` (AuthStack)  
**Purpose:** Collect phone number and request OTP.  
**Features:** Indonesian phone format (+62), input validation, calls `authApi.sendOTP`, navigates to `OTPVerify` with phone param.  
**Offline:** Button disabled.

---

### `OTPVerifyScreen`
**Route:** `OTPVerify` (AuthStack, params: `{ phone }`)  
**Purpose:** 6-digit OTP entry and verification.  
**Features:** `OtpBoxes` component, countdown resend timer, WA support link appears after ≥3 failures (`failCount`), calls `authApi.verifyOTP`, then `login()` from AuthContext, then navigates to `LoginSuccess`.  
**WA link:** Opens `https://wa.me/${EXPO_PUBLIC_SUPPORT_WA}`.

---

### `LoginSuccessScreen`
**Route:** `LoginSuccess` (AuthStack, params: `{ name, phone, token, user }`)  
**Purpose:** Post-login welcome; prompts user to set a name if not set.  
**Navigates to:** Main tab stack via `navigation.replace`.

---

## Main tabs

### `HomeScreen`
**Route:** `Beranda` (MainTab)  
**Purpose:** Dashboard — active group hero card + group list + quick actions.  
**Data:** `getMyGroups()`, `getGroupDetail()` + `getPayments()` for urgency badge, `getNotifications()` for bell badge.  
**Cache:** `CACHE_KEYS.GROUPS_LIST` (AsyncStorage, 24-hour TTL).  
**Key states:**
- Loading: skeleton hero + 3 skeleton list rows.
- Empty: centered icon + "Buat grup" / "Gabung kode" CTAs.
- Offline: `OfflineBanner` + stale timestamp + CTAs disabled with tooltip.
- Hero card (when active group exists): group name, nominal, period count, "Lihat detail" + "Bayar sekarang" (hidden when already paid).
**Auto-refresh:** `useFocusEffect` on every screen focus.  
**Bell badge:** amber dot when `unread_count > 0`.  
**Name gate:** `checkName()` alerts user to fill profile before creating/joining a group.

---

### `GroupsScreen`
**Route:** `Grup` (MainTab)  
**Purpose:** Full list of user's groups with role-based filtering.  
**Data:** `getMyGroups()` + parallel `getGroupDetail()` for each group.  
**Filters:** Segmented control — Semua / Ketua / Anggota.  
**Auto-refresh:** `useFocusEffect`.

---

### `NotificationsScreen`
**Route:** `Notifikasi` (MainTab)  
**Purpose:** Push notification inbox.  
**Data:** `getNotifications()`, `markRead()` on tap, `markAllRead()`.  
**Pagination:** load-more on scroll (`has_more`).  
**States:** loading, empty, error, pull-to-refresh.

---

### `ProfileScreen`
**Route:** `Profil` (MainTab)  
**Purpose:** User stats, name edit, settings, account actions.  
**Data:** `getUserStats()` → `{ group_count, total_iuran, win_count }`, `getMe()`.  
**Actions:**
- Edit name inline.
- "Kebijakan Privasi" → `Linking.openURL(EXPO_PUBLIC_PRIVACY_POLICY_URL)`.
- Logout → clears SecureStore + navigates to AuthNavigator.
- Delete account → two-step `Alert.alert` confirmation → `deleteAccount()` + logout.

---

## Group management

### `DetailGrupScreen`
**Route:** `GroupDetail` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Central hub for a single group — status, members, all actions.  
**Data:** `getGroupDetail()`, `getPeriods()`, `getPayments()`, `undianApi.getHistory()`.  
**Key computed state:**
- `isKetua` — user is the group creator.
- `currentPeriodUndianDone` — a winner exists for the current period.
- `hasAnyWinner` — at least one period has a winner (enables swap flow).
- `allHaveSlotOrder` — all members have a slot assigned (mode 3 complete).
- `prevPeriodClosed` — previous period is closed (required for mode 2 undian).
- `undianMode2Blocked` — mode 2 undian not allowed yet.
**Offline:** `OfflineBanner`; all write actions disabled.  
**Auto-refresh:** `useFocusEffect` + refetch on `isOnline` change.  
**Quick actions (all members):** Bayar, Tukar, Chat.  
**Ketua actions:** Mulai Arisan, Undian, Atur Tanggal, Set Giliran, Tukar Giliran (Ketua), Riwayat Bayar, Buku Arisan, Cek Hutang, Kelola Anggota, Bubarkan Grup, Approval Tukar.

---

### `BuatGrupStep1Screen`
**Route:** `BuatGrupStep1` (AppStack)  
**Purpose:** Step 1 of 3 — enter group name.  
**Navigates to:** `BuatGrupStep2 { name }`.

---

### `BuatGrupStep2Screen`
**Route:** `BuatGrupStep2` (AppStack, params: `{ name }`)  
**Purpose:** Step 2 of 3 — set iuran nominal (amount per period).  
**Navigates to:** `BuatGrupStep3 { name, nominal, frequency, periods }`.

---

### `BuatGrupStep3Screen`
**Route:** `BuatGrupStep3` (AppStack, params: `{ name, nominal, frequency, periods }`)  
**Purpose:** Step 3 of 3 — choose draw mode (`random | fixed | manual`), confirm, create group.  
**Calls:** `createGroup()`.  
**Navigates to:** `Invite { groupId, inviteCode, groupName }` on success.

---

### `InviteScreen`
**Route:** `Invite` (AppStack, params: `{ groupId, inviteCode, groupName }`)  
**Purpose:** Show invite code, member list polling, share/copy invite.  
**Data:** Polls `getGroupDetail()` every 5 s to update member list in real time.  
**Actions:** Copy code, Share via WhatsApp (`EXPO_PUBLIC_PLAYSTORE_URL`), Start Arisan (ketua, when recruiting complete).  
**Mode 2 banner:** "Grup siap! Mulai Undian Pertama" when group becomes active.

---

### `JoinGrupScreen`
**Route:** `JoinGrup` (AppStack)  
**Purpose:** Enter invite code to join a group.  
**Calls:** `getGroupByCode()` to preview group, then navigates to `JoinConfirm { code }`.

---

### `JoinConfirmScreen`
**Route:** `JoinConfirm` (AppStack, params: `{ code }`)  
**Purpose:** Preview group info and confirm join.  
**Calls:** `joinGroup()`.  
**Navigates to:** `navigation.reset` to `Main` on success.

---

### `SetGiliranScreen`
**Route:** `SetGiliran` (AppStack, params: `{ groupId, members[], isLocked? }`)  
**Purpose:** Ketua assigns slot order to all members (mode 1 / 3 fixed draw).  
**Component:** `DraggableFlatList` for drag-and-drop reordering.  
**Calls:** `setSlotOrder()`.  
**Locked view:** when `isLocked`, shows read-only list.

---

### `BukuArisanScreen`
**Route:** `BukuArisan` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Complete financial ledger — all periods, all payments, winners, summary totals.  
**Data:** `getBukuArisan()` → `{ group, members, periods[], summary }`.  
**Display:** Period accordion with winner spotlight, payment grid per member, collection rate.

---

## Payment flow

### `PaymentStatusScreen`
**Route:** `Bayar` (AppStack, params: `{ groupId, periodId, periodNumber }`)  
**Purpose:** Period payment status — all members, live progress bar, ketua confirmation.  
**Data:** `getPayments()` + `getGroupDetail()` to build full member list.  
**Realtime:** `usePaymentRealtime(periodId, payments)` — Supabase Realtime.  
**Offline:** `OfflineBanner` + cached data + confirm/cancel disabled.  
**Ketua:** Tap member row → modal to confirm (`confirmPayment`) or cancel (`cancelConfirm`).  
**States:** Skeleton rows for loading.

---

### `PaymentHistoryScreen`
**Route:** `PaymentHistory` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Historical view — all periods as accordion, payments per period lazy-fetched on expand.  
**Data:** `getPeriods()` then `getPayments(periodId)` on accordion open.  
**Pill colors:** `closed` → mint "Selesai", `active` → amber "Aktif", `upcoming` → neutral "Mendatang".

---

## Undian (lottery)

### `UndianScreen`
**Route:** `UndianPre` (AppStack, params: `{ groupId, periodId, periodNumber, isKetua }`)  
**Purpose:** Pre-undian screen — shows candidates, runs the lottery.

**Mode 1 (fixed):** Ketua-only "Mulai Undian" button. Calls `undianApi.start(mode: 'fixed')`. After winner: show "Undian selesai" — hides button.

**Mode 2 (random):** Same as Mode 1. Non-ketua sees "Menunggu ketua memulai undian..." pill. Polls `getGroupDetail()` every 3 s until winner detected (then stops). Calls `undianApi.start(mode: 'random')`.

**Mode 3 (manual):** `DraggableFlatList` for all members — drag to set order → "Simpan Urutan Pemenang" → `setSlotOrder()`. Shows "Urutan sudah dikunci" view after save.

**Post-undian (mode 1/2):** Broadcasts result to chat (`sendMessage`), navigates to `UndianResult`.

---

### `UndianResultScreen`
**Route:** `UndianResult` (AppStack, params: `{ groupId, periodId, winnerName, winnerAmount, periodeKe, ketuaId? }`)  
**Purpose:** Winner spotlight + list of all period winners.  
**Data:** `undianApi.getHistory()`.  
**Actions:** "Ucapkan selamat di chat" → `Chat`, "Lihat semua" → `RiwayatPemenang`.

---

### `RiwayatPemenangScreen`
**Route:** `RiwayatPemenang` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Read-only list of all winners per period.  
**Data:** `undianApi.getHistory()`.  
**States:** Loading, empty, error, pull-to-refresh.

---

## Swap (giliran tukar)

### `RequestSwapScreen`
**Route:** `RequestSwap` (AppStack, params: `{ groupId, myPeriod }`)  
**Purpose:** Member requests to swap their period slot with another member.  
**Data:** `getGroupDetail()` → member list. Filters out current user + already-swapped slots.  
**Validation:** `swap_count >= 2` disables swap (limit 2× per user). `slot_order == null` → alert to contact ketua.  
**Calls:** `swapsApi.request()`.  
**Post-success:** `navigation.replace('SwapStatus', { requestId })`.

---

### `SwapStatusScreen`
**Route:** `SwapStatus` (AppStack, params: `{ requestId }`)  
**Purpose:** Track progress of user's own swap request through 4 steps.  
**Data:** `swapsApi.getMySwaps()` filtered by `requestId`.  
**Steps:** Permintaan Dibuat → Menunggu Respons Target → Menunggu Persetujuan Ketua → Selesai.  
**Rejected steps:** Red X icon, muted text.  
**States:** Pull-to-refresh, loading, error.

---

### `SwapInboxScreen`
**Route:** `SwapInbox` (AppStack)  
**Purpose:** Incoming swap requests where current user is the target.  
**Data:** `swapsApi.getMySwaps()` filtered by `target_id === user.id`, status `pending | ketua_pending`.  
**Badge:** "Dari Ketua" badge on ketua-initiated swaps (`ketua_pending`).  
**Actions:** Terima / Tolak inline with `Alert` confirmation → `swapsApi.respond()`.

---

### `SwapApprovalScreen`
**Route:** `SwapApproval` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Ketua reviews swaps awaiting final approval.  
**Data:** `swapsApi.getGroupSwaps(groupId)` filtered by `status === 'waiting_ketua'`.  
**Actions:** Setujui (`approved`) / Tolak (`ketua_rejected`) → `swapsApi.approve()`.

---

### `SwapByKetuaScreen`
**Route:** `SwapByKetua` (AppStack, params: `{ groupId, groupName, winnerId?, winnerName? }`)  
**Purpose:** Ketua initiates a swap between any two members directly.  
**Data:** `getGroupDetail()` → member list.  
**Pre-fill:** Anggota A pre-filled with current winner if `winnerId` passed.  
**Calls:** `swapsApi.requestAsKetua()`.

---

## Chat & activity

### `ChatScreen`
**Route:** `Chat` (AppStack, params: `{ groupId, groupName, memberCount, ketuaId, periodNumber?, winnerName?, paidCount?, dueDate? }`)  
**Purpose:** Group chat with realtime messages.  
**Data:** `fetchMessages()` via Supabase JS (with users JOIN), `subscribeMessages()` for realtime INSERTs.  
**Realtime:** Supabase `postgres_changes` on `messages` table filtered by `group_id`.  
**Deduplication:** Optimistic updates checked by `id` before prepending realtime message.  
**Typing indicator:** Polls `getTyping()` every 3 s; debounces `sendTyping()` 500 ms on input.  
**Tab filters:** Semua / Obrolan / Sistem (filters by `type: 'user' | 'system'`).  
**Message badge:** "Ketua" badge when `message.user_id === ketuaId`.  
**Offline:** `OfflineBanner` + input disabled + send disabled.  
**Sound:** `useChatSound` plays `notification.wav` on incoming messages.

---

### `ActivityLogScreen`
**Route:** `ActivityLog` (AppStack, params: `{ groupId, groupName }`)  
**Purpose:** Chronological log of group events (undian, bayar, buat grup, swap).  
**Data:** `getActivityLog()` with pagination (`limit`, `offset`).  
**Display:** Icon + tone per entry type, formatted timestamp.  
**Pagination:** Infinite scroll (load more on end-reached).
