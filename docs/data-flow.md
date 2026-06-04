# Data Flow

---

## HTTP — `apiCall` wrapper

Every network call flows through `src/api/client.ts`:

```
Screen / Hook
  └─ domain API module (auth.ts, groups.ts, …)
       └─ apiCall<T>(path, options)
            ├─ AbortController with 15 s timeout
            ├─ Injects Authorization header from token
            ├─ fetch(API_URL + path)
            ├─ Non-2xx → parse { error } → throw ApiError(status, msg)
            └─ 2xx → res.json() → T
```

All error messages shown to users are in **Bahasa Indonesia**. Timeout produces: `"Koneksi timeout. Periksa jaringan lalu coba lagi."` Network failure produces: `"Tidak dapat terhubung ke server. Periksa jaringan kamu."`

---

## Offline cache — AsyncStorage + TTL

`src/utils/cache.ts` wraps `@react-native-async-storage/async-storage`:

```ts
cache.set(key, data)      // writes { data, ts: Date.now() }
cache.get(key)            // returns { data, isStale } or null — TTL: 24 hours
cache.delete(key)
```

### Cache keys (`CACHE_KEYS`)

| Key | Data cached |
|-----|------------|
| `CACHE_KEYS.GROUPS_LIST` | `Group[]` from `getMyGroups()` |
| `CACHE_KEYS.groupDetail(id)` | `GroupDetail` for a specific group |
| `CACHE_KEYS.payments(periodId)` | `Payment[]` for a specific period |
| `CACHE_KEYS.notifications` | Notification inbox |

### Cache strategy (HomeScreen as example)

```
Online?
  yes → fetch from API → update state → write cache
  no  → read cache → update state (stale OK for display)
fetch throws?
  → read cache as fallback → show stale timestamp
```

Screens display a "Data terakhir diperbarui: HH:MM, DD Mon" label when showing stale offline data.

---

## Supabase Realtime — payments

`usePaymentRealtime(periodId, initial)` in `src/hooks/usePaymentRealtime.ts`:

```
Supabase Realtime
  └─ channel: payments:<periodId>
       └─ postgres_changes: INSERT | UPDATE | DELETE
            └─ filter: period_id=eq.<periodId>
                 └─ merge into local Payment[] state
                      ├─ INSERT/UPDATE: find by user_id, replace row (preserve user JOIN field)
                      └─ DELETE: remove by payload.old.user_id
```

The `user` JOIN field is not included in realtime payloads (Supabase limitation). It's preserved from the existing row so the UI doesn't lose the member name/phone.

Used by: `PaymentStatusScreen`.

---

## Supabase Realtime — chat messages

`subscribeMessages(groupId, onNewMessage)` in `src/api/chat.ts`:

```
Supabase Realtime
  └─ channel: messages:<groupId>
       └─ postgres_changes: INSERT
            └─ filter: group_id=eq.<groupId>
                 └─ callback(raw message without user JOIN)
                      └─ ChatScreen enriches user_name from userNameCache (useRef map)
```

Initial message load uses `supabase.from('messages').select('... user:users!user_id(name,phone)')` which does include the JOIN. The name cache is populated from this initial load and reused for realtime messages.

System messages: `user_id IS NULL` in DB → `type: 'system'`, `user_name: 'Sistem'`.

---

## Push notifications

Flow on backend → mobile:

```
Backend event (payment confirmed, undian, swap)
  └─ POST to Expo Push API with expo_push_token
       └─ Mobile OS delivers notification
            └─ App foreground?
                 ├─ yes → Notifications.setNotificationHandler shows alert
                 │          └─ App.tsx listener plays notification.wav via expo-av
                 └─ no  → OS shows system notification
```

Token registration: `updatePushToken(token, expoPushToken)` called after `Notifications.getExpoPushTokenAsync()` on login or app boot. Field name in API: `expo_push_token`.

---

## Auth token lifecycle

```
PhoneInput → OTPVerify
  └─ authApi.verifyOTP() returns { token, user }
       └─ AuthContext.login(token, user)
            ├─ SecureStore.set('arisan_auth_token', token)
            ├─ SecureStore.set('arisan_auth_user', JSON.stringify(user))
            └─ setState → RootNavigator shows AppNavigator

App boot (AuthContext useEffect)
  ├─ SecureStore.get(both keys)
  ├─ GET /api/users/me to validate token
  │    ├─ OK → merge fresh user data, setToken + setUser
  │    ├─ 401/403 → delete keys → no token → AuthNavigator
  │    └─ network error → keep cache → setToken + setUser (offline-safe)
  └─ setIsLoading(false)

Logout / deleteAccount
  └─ SecureStore.delete(both keys) → setToken(null) → AuthNavigator
```

---

## Focus-triggered refresh pattern

Screens that navigate away and return (e.g. after creating a group, completing a payment) use `useFocusEffect` to reload data:

```ts
useFocusEffect(
  useCallback(() => {
    load();
  }, [load])
);
```

`load` must be a `useCallback`-wrapped function with stable dependencies to avoid infinite effect loops.

Screens using this pattern: `HomeScreen`, `GroupsScreen`, `DetailGrupScreen`.

---

## Polling pattern (undian Mode 2)

`UndianScreen` polls `getGroupDetail()` every 3 s while waiting for ketua to start undian:

```ts
const interval = setInterval(() => {
  load(false);   // false = skip setLoadingData to avoid effect restart
}, 3000);
return () => clearInterval(interval);
```

`load(showLoading = true)` parameter: polling calls pass `false` to skip `setLoadingData(true)` — otherwise each poll toggles loading state, destroying and recreating the interval.

Polling stops automatically when a winner is detected for the current period.

---

## Typing indicator

`ChatScreen` sends typing presence to the backend on each keypress (debounced 500 ms) and polls for other typers every 3 s:

```
User types
  └─ debounce 500ms → sendTyping(token, groupId)
         └─ POST /api/groups/:id/typing — server stores {user_id, name, ts}

Poll every 3s → getTyping(token, groupId)
  └─ GET /api/groups/:id/typing
       └─ server returns users typed within last 5s
            └─ ChatScreen shows "[Nama] sedang mengetik..."
```

Server-side TTL for typing presence: 5 seconds (in-memory, no DB).

---

## Field name mapping (backend ↔ mobile)

The backend uses Indonesian DB column names. Adapter functions in the API modules translate:

| Backend (DB) | Mobile TypeScript |
|-------------|------------------|
| `ketua_id` | `created_by` |
| `frekuensi` | `frequency` |
| `jumlah_periode` | `total_periods` |
| `mode_undian` | `draw_mode` |
| `urutan` | `slot_order` |
| `jumlah_tukar` | `swap_count` |
| `periode_ke` | `period_number` |
| `jatuh_tempo` | `due_date` |
| `tanggal_pelaksanaan` | `execution_date` |
| `status: 'completed'` | `status: 'closed'` |
| `users` (Supabase JOIN plural) | `user` (singular) |
