# MO-5 — Tukar Giliran UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-4 + BE-5 selesai.
> Scope: src/screens/swaps/ + src/api/swaps.ts.
> ```

---

## `src/api/swaps.ts`

```typescript
export const swapsApi = {
  request: (targetId: string, groupId: string, token: string) =>
    apiCall('/api/swaps', { method: 'POST', body: JSON.stringify({ target_id: targetId, group_id: groupId }), token }),
  respond: (swapId: string, response: 'accepted'|'rejected', token: string) =>
    apiCall(`/api/swaps/${swapId}/respond`, { method: 'POST', body: JSON.stringify({ response }), token }),
  approve: (swapId: string, decision: 'approved'|'ketua_rejected', token: string) =>
    apiCall(`/api/swaps/${swapId}/approve`, { method: 'POST', body: JSON.stringify({ decision }), token }),
  getMySwaps: (token: string) =>
    apiCall<{ swaps: Swap[] }>('/api/swaps/my', { token }),
  getGroupSwaps: (groupId: string, token: string) =>
    apiCall<{ swaps: Swap[] }>(`/api/swaps/group/${groupId}`, { token }),
};
```

---

## Screen: `RequestSwapScreen.tsx`

List anggota grup. Tap anggota → konfirmasi "Minta tukar giliran dengan [nama]?". Error jika sudah 2x swap atau tidak ada periode yang bisa ditukar.

## Screen: `SwapInboxScreen.tsx`

List swap yang masuk ke user ini (status pending). Tap → modal "Terima" / "Tolak" dengan info: siapa yang minta, giliran mana yang ditukar.

## Screen: `SwapApprovalScreen.tsx` (ketua only)

List swap yang sudah diterima target, menunggu approval ketua. Tombol "Setujui" / "Tolak". Tampilkan: siapa minta tukar dengan siapa, giliran periode berapa.

---

## Checklist

```
[ ] RequestSwap: error jika sudah 2x swap di grup ini?
[ ] SwapInbox: hanya swap yang ditujukan ke user ini?
[ ] SwapApproval: hanya tampil untuk ketua?
[ ] Setelah approved: urutan di DetailGrupScreen ter-update?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): swap giliran — request, respond, approve"
Update MO-5.
```

**Sesi berikutnya:** `MO-6-chat.md`

---
---

