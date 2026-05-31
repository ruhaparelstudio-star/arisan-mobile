# MO-6 — Chat & Activity Log UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md. Konfirmasi MO-5 + BE-6 selesai.
> WAJIB konfirmasi dulu: apakah library stream-chat-expo boleh diinstall?
> Cek .claude/designs/ untuk mockup ChatScreen dan ActivityLog.
> Scope: src/screens/chat/ SAJA.
> ```

---

## Dependency (konfirmasi dulu sebelum install)

```bash
npm install stream-chat-expo stream-chat-react-native
```

---

## `ChatScreen.tsx`

Gunakan komponen Stream.io:
```typescript
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';
```

Konfigurasi:
- Badge "Ketua" di nama ketua — gunakan `renderUsername` atau custom avatar
- Disable delete: set `messageActions` tanpa 'delete'
- Infinite scroll 30 pesan — default Stream SDK
- Typing indicator — default Stream SDK

Offline: OfflineBanner + disable `MessageInput`:
```typescript
<MessageInput disabled={!isOnline} />
```

States: skeleton 5 bubble, offline banner.

---

## `ActivityLogScreen.tsx`

API: `GET /api/groups/:id/activity-log`

Tampilkan: `[timestamp] · [nama aktor] [deskripsi]`
Format tanggal: "12 Jun 2025 · 14:30"
Read-only. Infinite scroll 30 item. Empty state.

---

## Checklist

```
[ ] Stream.io terhubung ke channel yang dibuat saat buat grup?
[ ] Delete message dinonaktifkan?
[ ] Badge "Ketua" muncul?
[ ] Offline: input disabled + banner?
[ ] ActivityLog: read-only, tidak ada swipe delete?
[ ] System messages dari undian/bayar muncul di chat?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): chat Stream.io + activity log"
Update MO-6. Catat versi stream-chat-expo.
```

**Sesi berikutnya:** `MO-7-offline.md`

---
---

