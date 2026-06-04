# Navigation

React Navigation 6 with a three-level hierarchy: `RootNavigator` → `AuthNavigator | AppNavigator` → `MainTabs`.

---

## Navigator tree

```
RootNavigator (NavigationContainer)
├── AuthNavigator  (NativeStack, shown when token === null)
│   ├── Splash
│   ├── PhoneInput
│   ├── OTPVerify          { phone: string }
│   └── LoginSuccess       { name, phone, token, user }
│
└── AppNavigator  (NativeStack, shown when token is set)
    ├── Main  (BottomTabs)
    │   ├── Beranda        → HomeScreen
    │   ├── Grup           → GroupsScreen
    │   ├── Notifikasi     → NotificationsScreen
    │   └── Profil         → ProfileScreen
    │
    ├── GroupDetail        { groupId, groupName }
    ├── Chat               { groupId, groupName, memberCount, ketuaId, periodNumber?, winnerName?, paidCount?, dueDate? }
    ├── BuatGrupStep1      (undefined)
    ├── BuatGrupStep2      { name }
    ├── BuatGrupStep3      { name, nominal, frequency, periods }
    ├── Invite             { groupId, inviteCode, groupName }
    ├── JoinGrup           (undefined)
    ├── JoinConfirm        { code }
    ├── UndianPre          { groupId, periodId, periodNumber, isKetua }
    ├── UndianResult       { groupId, periodId, winnerName, winnerAmount, periodeKe, ketuaId? }
    ├── RiwayatPemenang    { groupId, groupName }
    ├── Bayar              { groupId, periodId, periodNumber }
    ├── PaymentHistory     { groupId, groupName }
    ├── RequestSwap        { groupId, myPeriod }
    ├── SwapStatus         { requestId }
    ├── SwapInbox          (undefined)
    ├── SwapApproval       { groupId, groupName }
    ├── SwapByKetua        { groupId, groupName, winnerId?, winnerName? }
    ├── ActivityLog        { groupId, groupName }
    ├── SetGiliran         { groupId, members[], isLocked? }
    └── BukuArisan         { groupId, groupName }
```

---

## Bottom tab bar

Custom tab bar (not the default React Navigation tab bar). Rendered by `AppNavigator` using `useSafeAreaInsets` for bottom padding.

| Tab | Icon | Component |
|-----|------|-----------|
| Beranda | `home` | `HomeScreen` |
| Grup | `users` | `GroupsScreen` |
| Notifikasi | `bell` | `NotificationsScreen` |
| Profil | `user` | `ProfileScreen` |

Active tab: icon `strokeWidth 2.2`, label color `Colors.primary`, font `Fonts.bodyBold`.  
Inactive: `strokeWidth 1.8`, label color `Colors.muted`, font `Fonts.bodyMedium`.

---

## Navigation patterns

### Auth gate

`RootNavigator` reads `token` from `AuthContext`. While `isLoading` is true (SecureStore restore in progress), it shows a full-screen spinner. Once resolved, it swaps navigators — no explicit redirect needed.

### Focus-triggered refresh

Screens that display data potentially changed by other screens use `useFocusEffect`:

```ts
useFocusEffect(useCallback(() => { load(); }, [load]));
```

Screens that do this: `HomeScreen`, `GroupsScreen`, `DetailGrupScreen`.

### Post-action navigation

- After **creating a group**: navigate to `Invite` → then `GroupDetail` on join.
- After **joining a group**: `navigation.reset` to `Main` (clears join flow from stack).
- After **requesting a swap**: `navigation.replace('SwapStatus', { requestId })`.
- After **disbanding a group**: `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })`.
- After **undian result**: navigate to `UndianResult`, from there optionally to `Chat` or `RiwayatPemenang`.

### Animation

All `AppNavigator` screens use `animation: 'slide_from_right'`. Auth screens use default (no animation specified).

---

## Type safety

All param lists are declared in `src/navigation/types.ts`:

- `AuthStackParamList`
- `MainTabParamList`
- `AppStackParamList`

Screen components receive typed `NativeStackScreenProps<AppStackParamList, 'RouteName'>` or `CompositeScreenProps` for tab screens that also navigate to stack routes.
