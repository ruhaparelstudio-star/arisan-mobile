# MO-1 — Auth & Onboarding UI

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md sekarang.
> Konfirmasi: MO-0 selesai + BE-1 sudah live (bisa hit /api/auth/send-otp)?
> Cek .claude/designs/ untuk mockup: Splash, PhoneInput, OTPVerify, LoginSuccess.
> Scope: src/screens/auth/ + src/api/auth.ts + useAuth.ts (update).
> ```

---

## Konteks

Semua screen onboarding. User masuk hanya via nomor HP + OTP WA. Tidak ada password. JWT disimpan di SecureStore.

**Cek mockup DULU.** Jika ada di `.claude/designs/`, ikuti persis — warna, spacing, komponen. Jika tidak ada, pakai Design System dari CLAUDE.md.

---

## `src/api/auth.ts`

```typescript
import { apiCall } from './client';

export const authApi = {
  sendOTP: (phone: string) =>
    apiCall<{ message: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, code: string) =>
    apiCall<{ token: string; user: { id: string; phone: string; name: string | null } }>(
      '/api/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, code }) }
    ),
};
```

---

## `SplashScreen.tsx`

Tampilkan (ikuti mockup jika ada):
- Logo: kotak hijau `#00C897` dengan huruf "A" putih, border radius 14
- Judul: "Arisan App"
- Tagline: "Kelola arisan digital, transparan & mudah"
- Tombol "Mulai sekarang" (primary)
- Tombol "Sudah punya akun" (outline)

States: tidak ada loading — static screen.

---

## `PhoneInputScreen.tsx`

Tampilkan:
- Back button
- Header "Masukkan nomor HP"
- Sub "Kode OTP akan dikirim ke WhatsApp kamu"
- Row: prefix "+62" (static, kotak abu) + input angka
- Hint "Pastikan WhatsApp aktif di nomor ini"
- Tombol "Kirim OTP" (disabled jika input kosong/invalid)

States WAJIB:
- Default: tombol disabled
- Valid input: tombol aktif
- Loading: tombol disabled + ActivityIndicator
- Error: teks merah spesifik di bawah input (Bahasa Indonesia)
- Rate limit (429): "Terlalu banyak percobaan. Coba lagi dalam 1 jam."
- Fonnte gagal (503): "Gagal mengirim OTP. Tunggu 30 detik lalu coba lagi."

Validasi lokal: angka saja, minimal 9 digit setelah +62.

---

## `OTPVerifyScreen.tsx`

Tampilkan:
- Header "Verifikasi OTP"
- Sub "OTP dikirim ke +62 [nomor]. Biasanya tiba dalam 30 detik."
- 6 kotak input OTP — auto-focus, auto-advance ke kotak berikutnya
- Countdown: "Kode berlaku selama MM:SS"
- Tombol kirim ulang: disabled 30 detik, aktif setelahnya

States WAJIB:
- Mengisi: kotak terisi satu per satu
- Lengkap: auto-submit
- Loading: disabled + ActivityIndicator
- OTP salah: "OTP salah. Sisa [n] percobaan sebelum kode di-reset."
- Expired: "OTP sudah expired. Kirim ulang OTP."
- Success: simpan JWT + navigate ke LoginSuccessScreen

---

## `LoginSuccessScreen.tsx`

Tampilkan:
- Ikon centang besar (warna `#00C897`)
- "Login berhasil!"
- Card profil: nama atau nomor HP + nomor
- Tombol "Ke beranda →"

Auto-navigate ke HomeScreen setelah 2 detik ATAU tap tombol.

---

## `useAuth.ts` — Update (implementasi penuh)

Update dari skeleton MO-0:
- `login(token, user)`: simpan ke SecureStore, update state
- `logout()`: hapus SecureStore, navigate ke Splash
- `isLoading`: true saat cek token awal di SecureStore

---

## Checklist Anti-Hallucination

```
[ ] JWT disimpan di SecureStore (bukan AsyncStorage)?
[ ] sendOTP hit POST /api/auth/send-otp?
[ ] verifyOTP: token disimpan, navigate ke LoginSuccessScreen?
[ ] Error messages semua Bahasa Indonesia?
[ ] Rate limit (429) dan Fonnte error (503) punya pesan spesifik?
[ ] Mockup diikuti (atau dikonfirmasi tidak ada)?
```

## Update PROGRESS.md — WAJIB

```
Commit: "feat(mo): onboarding + OTP auth screens"
Update MO-1. Catat: apakah mockup diikuti atau buat baru.
Branch: feature/mo-w02-auth → PR ke develop
```

**Sesi berikutnya:** `MO-2-groups.md`

---
---

