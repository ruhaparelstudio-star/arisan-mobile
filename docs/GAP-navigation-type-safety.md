# GAP — Type Safety Navigation: as any Casts + Data Hilang

**Severity:** Low  
**Status:** Diperbaiki  
**Ditemukan:** Code audit 2026-06-03  
**File:** `src/screens/groups/JoinConfirmScreen.tsx`, `src/screens/groups/JoinGrupScreen.tsx`, `src/screens/groups/GroupsScreen.tsx`, `src/screens/undian/UndianResultScreen.tsx`, `src/screens/undian/UndianScreen.tsx`, `src/navigation/types.ts`

## Masalah

### 1. `as any` Navigation Casts
Beberapa screen menggunakan `(navigation as any).navigate(...)` untuk menavigasi ke route yang sebenarnya valid:

| Screen | Route | Masalah |
|--------|-------|---------|
| `JoinGrupScreen` | `'JoinConfirm'` | Ada di `AppStackParamList`, tidak perlu `as any` |
| `JoinConfirmScreen` | `'Profil'` | Butuh `CompositeScreenProps` |
| `JoinConfirmScreen` | `'GroupDetail'` | Ada di `AppStackParamList`, tidak perlu `as any` |
| `GroupsScreen` | `'Profil'` | Sudah punya `CompositeScreenProps`, tinggal hapus cast |

### 2. `groupName` Hardcoded di UndianResultScreen
`UndianResultScreen` navigate ke Chat dan RiwayatPemenang dengan `groupName: 'Grup'` hardcoded karena field `groupName` tidak ada di route params.

## Fix yang Diterapkan

1. **JoinGrupScreen** — hapus `as any`, navigate langsung
2. **JoinConfirmScreen** — tambah `CompositeScreenProps<NativeStackScreenProps, BottomTabScreenProps>`, hapus semua `as any`
3. **GroupsScreen** — hapus `as any` (CompositeScreenProps sudah ada)
4. **types.ts** — tambah `groupName?: string` ke `UndianResult` route params
5. **UndianResultScreen** — destructure `groupName = 'Grup'` dari params, pakai di navigate
6. **UndianScreen** — pass `loadedGroupName` saat navigate ke UndianResult (dua tempat)
