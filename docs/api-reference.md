# API Reference

All HTTP calls go through `src/api/client.ts → apiCall<T>()`. Never use `fetch` directly.

---

## `client.ts` — base HTTP wrapper

```ts
apiCall<T>(path: string, options?: RequestInit & { token?: string }): Promise<T>
```

- Base URL: `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`).
- Timeout: 15 000 ms — throws `ApiError(0, '...')` on abort.
- Injects `Content-Type: application/json` and `Authorization: Bearer <token>` automatically.
- Non-2xx responses: parses body for `{ error: string }`, throws `ApiError(status, message)`.

```ts
class ApiError extends Error {
  status: number;   // HTTP status, or 0 for network/timeout errors
}
```

---

## `auth.ts`

### Types

```ts
interface SendOtpResponse { message: string }

interface VerifyOtpResponse {
  token: string;
  user: { id: string; phone: string; name: string | null };
}

interface UserProfile { id: string; phone: string; name: string | null; created_at: string }

interface UserStats { group_count: number; total_iuran: number; win_count: number }
```

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `authApi.sendOTP(phone)` | POST `/api/auth/send-otp` | — | `SendOtpResponse` |
| `authApi.verifyOTP(phone, code)` | POST `/api/auth/verify-otp` | — | `VerifyOtpResponse` |
| `getMe(token)` | GET `/api/users/me` | ✓ | `UserProfile` |
| `updateMe(token, { name? })` | PUT `/api/users/me` | ✓ | `{ message }` |
| `updatePushToken(token, pushToken)` | PUT `/api/users/push-token` | ✓ | `{ message }` |
| `deleteAccount(token)` | DELETE `/api/users/me` | ✓ | `{ message }` |
| `getUserStats(token)` | GET `/api/users/me/stats` | ✓ | `UserStats` |

> `updatePushToken` sends `{ expo_push_token }` — field name differs from the conceptual "push_token".

---

## `groups.ts`

### Types

```ts
interface Group {
  id: string; name: string; nominal: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  total_periods: number;
  draw_mode: 'random' | 'fixed' | 'manual';
  invite_code: string;
  status: 'recruiting' | 'active' | 'completed' | 'disbanded';
  created_by: string;   // maps from DB ketua_id
  created_at: string;
}

interface GroupMember {
  user_id: string;
  slot_order: number | null;  // maps from DB urutan
  swap_count: number;          // maps from DB jumlah_tukar
  user: { id: string; name: string | null; phone: string };
}

interface GroupDetail extends Group {
  members: GroupMember[];
  current_period: number | null;
  current_period_id: string | null;
}

interface BukuArisan { group; members; periods: BukuPeriod[]; summary }
interface HutangInfo { debtors[]; member_count; expected_per_winner; actual_per_winner; impact_per_winner }
```

> Backend uses Indonesian field names (`frekuensi`, `jumlah_periode`, `mode_undian`, `urutan`, `ketua_id`). `adaptGroup()` and `adaptMember()` translate these.

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `getMyGroups(token)` | GET `/api/groups` | ✓ | `Group[]` |
| `getGroupDetail(token, groupId)` | GET `/api/groups/:id` | ✓ | `GroupDetail` |
| `createGroup(token, data)` | POST `/api/groups` | ✓ | `Group` |
| `joinGroup(token, invite_code)` | POST `/api/groups/join` | ✓ | `{ message }` |
| `getGroupByCode(token, invite_code)` | GET `/api/groups/code/:code` | ✓ | `Group & { member_count }` |
| `leaveGroup(token, groupId)` | DELETE `/api/groups/:id/leave` | ✓ | `{ message }` |
| `generateInvite(token, groupId)` | POST `/api/groups/:id/invite` | ✓ | `{ invite_code }` |
| `setSlotOrder(token, groupId, order)` | PUT `/api/groups/:id/urutan` | ✓ | `{ message }` |
| `disbandGroup(token, groupId)` | DELETE `/api/groups/:id` | ✓ | `{ message }` |
| `startArisan(token, groupId)` | POST `/api/groups/:id/start` | ✓ | `{ message }` |
| `setTanggalPelaksanaan(token, groupId, periodId, tanggal)` | PUT `/api/groups/:id/periods/:pid/tanggal` | ✓ | `{ tanggal_pelaksanaan, jatuh_tempo }` |
| `getBukuArisan(token, groupId)` | GET `/api/groups/:id/buku` | ✓ | `BukuArisan` |
| `getHutangInfo(token, groupId)` | GET `/api/groups/:id/hutang` | ✓ | `HutangInfo` |
| `resolveKabur(token, groupId, memberId, mode)` | POST `/api/groups/:id/kabur/:mid/resolve` | ✓ | `{ message, mode, total_resolved }` |
| `kickMember(token, groupId, memberId)` | DELETE `/api/groups/:id/members/:mid` | ✓ | `{ message, was_active }` |

**`createGroup` payload mapping:**

```ts
// Frontend key → Backend key
name           → name
nominal        → nominal
frequency      → frekuensi
total_periods  → jumlah_periode
draw_mode      → mode_undian
```

**`setSlotOrder` payload:** `{ urutan: string[] }` — array of `user_id` strings in desired order.

---

## `payments.ts`

### Types

```ts
interface Payment {
  id: string | null;   // null if no DB record yet
  period_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'late';
  confirmed_by: string | null;
  confirmed_at: string | null;
  user: { name: string | null; phone: string };
}

interface Period {
  id: string; group_id: string;
  period_number: number;   // DB: periode_ke
  due_date: string;        // DB: jatuh_tempo
  status: 'upcoming' | 'active' | 'closed';  // DB 'completed' maps to 'closed'
  execution_date?: string | null;             // DB: tanggal_pelaksanaan
}
```

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `getPayments(token, groupId, periodId)` | GET `/api/payments/:groupId/:periodId` | ✓ | `Payment[]` |
| `confirmPayment(token, groupId, periodId, userId)` | POST `/api/payments/:groupId/:periodId/confirm` | ✓ | `{ message }` |
| `cancelConfirm(token, groupId, periodId, userId)` | DELETE `/api/payments/:groupId/:periodId/confirm` | ✓ | `{ message }` |
| `getPeriods(token, groupId)` | GET `/api/groups/:groupId/periods` | ✓ | `Period[]` |

`confirmPayment` / `cancelConfirm` body: `{ member_id: userId }`.

---

## `undian.ts`

### Types

```ts
interface Winner {
  id: string; user_id: string;
  period_number: number;   // DB: periods.periode_ke
  winner_name: string;     // DB: users.name
  arisan_amount: number;   // always 0 (not stored in DB)
  drawn_at: string;        // DB: created_at
}
```

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `undianApi.start(groupId, mode, periodId, winnerId?, token?)` | POST `/api/groups/:id/undian` | ✓ | `{ winner: { id, name }, periode_ke }` |
| `undianApi.getHistory(groupId, token)` | GET `/api/groups/:id/winners` | ✓ | `{ winners: Winner[] }` |

`undianApi.start` body: `{ mode, period_id, winner_id? }`.  
`mode`: `'fixed' | 'random' | 'manual'`.

---

## `swaps.ts`

### Types

```ts
interface Swap {
  id: string; group_id: string;
  requester_id: string; target_id: string;
  status: 'pending' | 'ketua_pending' | 'waiting_ketua'
        | 'target_accepted' | 'target_rejected'
        | 'approved' | 'ketua_rejected';
  created_at: string;
  requester?: { name: string | null; phone: string };
  target?: { name: string | null; phone: string };
  requester_period?: number;   // local only — not stored in DB
  target_period?: number;      // local only — not stored in DB
}
```

### Swap status state machine

```
pending          → target responds
  ├─ target_accepted → waiting_ketua → ketua approves/rejects
  └─ target_rejected → (terminal)

ketua_pending    → target_id responds (ketua-initiated)
  └─ accepted    → auto-approved (skips waiting_ketua)

waiting_ketua    → ketua decision
  ├─ approved    → (terminal, slots exchanged)
  └─ ketua_rejected → (terminal)
```

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `swapsApi.request(targetId, groupId, token)` | POST `/api/swaps` | ✓ | `Swap` |
| `swapsApi.respond(swapId, response, token)` | POST `/api/swaps/:id/respond` | ✓ | `{ status }` |
| `swapsApi.approve(swapId, decision, token)` | POST `/api/swaps/:id/approve` | ✓ | `{ status }` |
| `swapsApi.getMySwaps(token)` | GET `/api/swaps/my` | ✓ | `{ swaps: Swap[] }` |
| `swapsApi.getGroupSwaps(groupId, token)` | GET `/api/swaps/group/:id` | ✓ | `{ swaps: Swap[] }` |
| `swapsApi.requestAsKetua(memberAId, memberBId, groupId, token)` | POST `/api/swaps/ketua` | ✓ | `Swap` |

---

## `chat.ts`

Chat uses **two transports**:

| Operation | Transport |
|-----------|-----------|
| Fetch messages | Supabase JS (`supabase.from('messages').select(...)`) with users JOIN |
| Subscribe new messages | Supabase Realtime (`postgres_changes INSERT` on `messages` table) |
| Send message | REST POST (backend validates membership) |
| Activity log | REST GET |
| Typing indicator | REST GET/POST |

### Types

```ts
interface ChatMessage {
  id: string; group_id: string; user_id: string;
  content: string; created_at: string;
  user_name?: string;
  type: 'user' | 'system';  // system when user_id is null in DB
}

interface ActivityLogEntry {
  id: string; icon: string;
  tone: 'mint' | 'blue' | 'neutral' | 'amber';
  text: string; created_at: string;
}
```

### Functions

| Function | Transport | Returns |
|----------|-----------|---------|
| `fetchMessages(groupId, limit?, before?)` | Supabase JS | `MessagesResponse` |
| `subscribeMessages(groupId, onNewMessage)` | Supabase Realtime | `() => void` (unsubscribe) |
| `sendMessage(token, groupId, content)` | POST `/api/groups/:id/messages` | `{ message: ChatMessage }` |
| `getActivityLog(token, groupId, limit?, offset?)` | GET `/api/groups/:id/activity-log` | `ActivityLogResponse` |
| `sendTyping(token, groupId)` | POST `/api/groups/:id/typing` | `{ ok }` |
| `getTyping(token, groupId)` | GET `/api/groups/:id/typing` | `{ typing: { id, name }[] }` |

Typing indicator TTL: 5 s server-side (in-memory).

---

## `notifications.ts`

### Types

```ts
interface Notification {
  id: string; type: string; title: string; body: string;
  data: Record<string, unknown> | null;
  is_read: boolean; created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number; has_more: boolean;
}
```

### Functions

| Function | Method + Path | Auth | Returns |
|----------|--------------|------|---------|
| `getNotifications(token, limit?, before?)` | GET `/api/notifications` | ✓ | `NotificationsResponse` |
| `markRead(token, id)` | PATCH `/api/notifications/:id/read` | ✓ | `{ message }` |
| `markAllRead(token)` | PATCH `/api/notifications/read-all` | ✓ | `{ message }` |
