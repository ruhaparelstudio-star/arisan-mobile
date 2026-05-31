# MO-4 — Undian UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-3 + BE-4 selesai.
> Cek .claude/designs/ untuk mockup UndianScreen dan RiwayatPemenang.
> Scope: src/screens/undian/ + src/api/undian.ts.
> ```

---

## `src/api/undian.ts`

```typescript
export const undianApi = {
  start: (groupId: string, mode: 'fixed'|'random'|'manual', periodId: string, winnerId?: string, token?: string) =>
    apiCall<{ winner: { id: string; name: string }; periode_ke: number }>(
      `/api/groups/${groupId}/undian`,
      { method: 'POST', body: JSON.stringify({ mode, period_id: periodId, winner_id: winnerId }), token }
    ),

  getHistory: (groupId: string, token: string) =>
    apiCall<{ winners: Winner[] }>(`/api/groups/${groupId}/winners`, { token }),
};
```

---

## `UndianScreen.tsx`

Tampilkan (ketua only):
- List anggota yang belum pernah menang
- Tombol "Mulai Undian" (aktif hanya jika user = ketua)
- Saat proses: spinner + teks "Sedang mengundi..."
- Hasil: nama pemenang besar + konfetti sederhana (bisa text animasi dulu)
- Pesan: "Pemenang Periode [N]: [nama]!"

Anggota: tampilkan status undian saja (siapa yang belum dapat giliran), tidak ada tombol mulai.

---

## `RiwayatPemenangScreen.tsx`

List semua pemenang per periode. Read-only — tidak ada delete. Empty state: "Belum ada pemenang".

---

## Checklist

```
[ ] Tombol "Mulai Undian" hanya tampil untuk ketua?
[ ] Hasil undian muncul dari response API (bukan random di client)?
[ ] System message muncul di chat setelah undian (test di ChatScreen)?
[ ] RiwayatPemenang: read-only, tidak ada delete?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): undian + riwayat pemenang"
Update MO-4.
```

**Sesi berikutnya:** `MO-5-swap.md`

---
---

