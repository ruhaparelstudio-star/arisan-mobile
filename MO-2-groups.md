# MO-2 — Manajemen Grup UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-1 + BE-2 selesai.
> Cek .claude/designs/ untuk mockup: Home, BuatGrup, DetailGrup, Invite, JoinGrup, SetGiliran.
> Scope: src/screens/home/ + src/screens/groups/ + src/api/groups.ts.
> ```

---

## `src/api/groups.ts`

```typescript
import { apiCall } from './client';

export const groupsApi = {
  getMyGroups: (token: string) =>
    apiCall<{ groups: Group[] }>('/api/groups', { token }),

  getDetail: (id: string, token: string) =>
    apiCall<{ group: Group; members: Member[] }>(`/api/groups/${id}`, { token }),

  create: (data: CreateGroupPayload, token: string) =>
    apiCall<{ group: Group }>('/api/groups', { method: 'POST', body: JSON.stringify(data), token }),

  join: (inviteCode: string, token: string) =>
    apiCall<{ group: Group; message: string }>('/api/groups/join', {
      method: 'POST', body: JSON.stringify({ invite_code: inviteCode }), token,
    }),

  setUrutan: (groupId: string, urutan: string[], token: string) =>
    apiCall<{ message: string }>(`/api/groups/${groupId}/urutan`, {
      method: 'PUT', body: JSON.stringify({ urutan }), token,
    }),

  disband: (groupId: string, token: string) =>
    apiCall<{ message: string }>(`/api/groups/${groupId}`, { method: 'DELETE', token }),

  leave: (groupId: string, token: string) =>
    apiCall<{ message: string }>(`/api/groups/${groupId}/leave`, { method: 'DELETE', token }),
};
```

---

## `HomeScreen.tsx`

Tampilkan:
- Header "Arisan App" + ikon notifikasi
- Row tombol: "Buat Grup" + "Gabung Grup"
- List `GrupCard` per grup
- Empty state: "Kamu belum punya grup. Buat atau gabung sekarang!"

`GrupCard`:
- Nama grup
- Nominal format: "Rp 500.000/bulan"
- Status badge: Rekrutmen / Aktif / Selesai
- Jumlah anggota "5/10"
- Badge "Ketua" jika user = ketua

States: skeleton (3 card), error + retry, empty.
**OfflineBanner** di atas konten.

---

## `BuatGrupScreen.tsx`

Form fields: Nama Grup · Nominal (Rupiah) · Frekuensi · Jumlah Periode · Mode Undian

Validasi lokal: nama min 3 char, nominal angka min 10.000, semua wajib.

States: loading, error "Sudah 3 grup aktif" (403), success → navigate ke DetailGrupScreen.

---

## `DetailGrupScreen.tsx`

Tampilkan: info grup, invite code (jika recruiting) + tombol Copy/Share, list anggota + urutan.

Tombol ketua: "Set Giliran" · "Generate Invite Baru" · "Bubarkan Grup"
Tombol anggota: "Keluar Grup"

**OfflineBanner** wajib ada.

---

## `JoinGrupScreen.tsx`

Input 8 karakter auto-uppercase. Preview info grup setelah kode valid. Tombol konfirmasi "Ya, Gabung".

Errors: kode tidak valid · grup penuh · limit 3 grup.

---

## `SetGiliranScreen.tsx`

> **Tanya developer dulu:** library drag & drop yang disetujui.
> Jangan install apapun sebelum konfirmasi.

Tampilkan list anggota + nomor urutan. Tombol "Simpan Urutan".

---

## Checklist

```
[ ] HomeScreen: token dari useAuth dipakai untuk setiap API call?
[ ] GrupCard: badge Ketua benar (cek ketua_id vs user id)?
[ ] OfflineBanner ada di HomeScreen dan DetailGrupScreen?
[ ] BuatGrup: error 403 "3 grup aktif" ditampilkan dengan baik?
[ ] JoinGrup: invite code di-uppercase sebelum kirim?
[ ] Mockup diikuti atau dikonfirmasi tidak ada?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): manajemen grup — home, buat, join, detail, invite, set giliran"
Update MO-2.
```

**Sesi berikutnya:** `MO-3-payments.md`

---
---

