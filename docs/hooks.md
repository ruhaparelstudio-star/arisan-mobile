# Custom Hooks

---

## `useAuth` (`src/hooks/useAuth.ts`)

Re-export from `AuthContext`. Must be called inside `<AuthProvider>`.

```ts
const { token, user, isLoading, login, logout, updateUser } = useAuth();
```

| Value | Type | Description |
|-------|------|-------------|
| `token` | `string \| null` | JWT bearer token from SecureStore |
| `user` | `AuthUser \| null` | `{ id, phone, name }` |
| `isLoading` | `boolean` | true while SecureStore restore is in progress |
| `login(token, user)` | `Promise<void>` | Persist to SecureStore + set state |
| `logout()` | `Promise<void>` | Clear SecureStore + reset state → triggers AuthNavigator |
| `updateUser(partial)` | `Promise<void>` | Merge + persist updated user fields |

**Offline-safe restore:** If SecureStore has a token but the server returns a network/timeout error, the session is kept. Only a `401`/`403` forces logout.

---

## `useNetworkStatus` (`src/hooks/useNetworkStatus.ts`)

```ts
const isOnline: boolean = useNetworkStatus();
```

Wraps `@react-native-community/netinfo`. Returns `true` only when both `isConnected` and `isInternetReachable` are truthy. Used by every screen to gate write actions and show `OfflineBanner`.

---

## `usePaymentRealtime` (`src/hooks/usePaymentRealtime.ts`)

```ts
const payments: Payment[] = usePaymentRealtime(periodId, initialPayments);
```

Subscribes to `postgres_changes` (`*` events) on the `payments` table filtered by `period_id` via Supabase Realtime. Merges incoming changes into local state:

- **INSERT / UPDATE:** finds existing row by `user_id`, preserves the `user` JOIN field (not included in realtime payload), and replaces the record.
- **DELETE:** removes row by `user_id` from `payload.old`.

Initial data sync: a stable content key (`user_id:status:id` concatenation) is used as the `useEffect` dependency so that a new array reference from the parent doesn't trigger a spurious re-sync.

Requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to be set. Gracefully no-ops if either is missing.

---

## `useChatSound` (`src/hooks/useChatSound.ts`)

```ts
const { playNotification } = useChatSound();
```

Loads `assets/sounds/notification.wav` via `expo-av` on mount. Sets audio mode:
- `allowsRecordingIOS: false`
- `playsInSilentModeIOS: false`
- `shouldDuckAndroid: true`
- `playThroughEarpieceAndroid: false`

`playNotification()`: rewinds to position 0 then plays. Errors are silently ignored. Sound is unloaded on unmount.

Used by `ChatScreen` to play audio feedback on incoming realtime messages.

---

## `AuthContext` internals (`src/context/AuthContext.tsx`)

Not a hook itself, but provides the `useAuth` hook.

```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

**State:** `token`, `user`, `isLoading` (all React state).

**Storage keys** (`src/utils/storage.ts`):
- `AUTH_TOKEN_KEY = 'arisan_auth_token'` — JWT string in SecureStore.
- `AUTH_USER_KEY = 'arisan_auth_user'` — JSON-serialised `AuthUser` in SecureStore.

**Boot flow:**
1. Read both keys from SecureStore.
2. If both present: call `GET /api/users/me` to validate.
   - 401/403 → delete both keys (force login).
   - Network error → keep cached user/token (offline-safe).
3. Merge fresh server user with cached user (server is authoritative).
4. Set `isLoading = false`.
