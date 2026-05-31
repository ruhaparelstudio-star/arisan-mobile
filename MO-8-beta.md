# MO-8 — Beta Launch

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md.
> Konfirmasi: semua MO-0 sampai MO-7 sudah [x]?
> List semua [!] blocker yang belum selesai sebelum mulai.
> Sesi ini: tidak ada fitur baru — persiapan launch saja.
> ```

---

## Privacy Policy Integration

```typescript
// Di SplashScreen / onboarding:
// Tambahkan: "Dengan melanjutkan, kamu setuju dengan Kebijakan Privasi kami"
// Link → buka URL Privacy Policy (dari BE atau Notion)
// Gunakan Linking.openURL(PRIVACY_POLICY_URL)

// Di ProfileScreen (jika ada) atau Settings:
// Link "Kebijakan Privasi"
```

---

## E2E Test Manual (di device fisik)

```
[ ] Login OTP → verifikasi → masuk HomeScreen
[ ] Buat grup → invite code muncul
[ ] Dari device ke-2: join grup via invite code
[ ] Konfirmasi bayar (ketua) → device ke-2 update realtime
[ ] Mulai undian → hasil muncul di chat kedua device
[ ] Swap giliran → 3 step flow selesai
[ ] Offline mode: matikan wifi → data tetap tampil
[ ] Online kembali → data auto-refresh
```

---

## Performance Test

```
[ ] HomeScreen load: mulai stopwatch → buka app → list grup muncul → < 2 detik
[ ] Realtime: device 1 konfirmasi bayar → device 2 update → < 1 detik
[ ] Tidak ada crash di skenario offline → online
```

---

## Build & Upload

```bash
# Option A: local build
npx expo build:android

# Option B: EAS (jika sudah setup)
eas build --platform android --profile preview

# Upload ke Google Play Console → Internal Testing
# Bagikan ke 10 grup beta
```

---

## Monitoring

Setelah launch:
- Firebase Crashlytics: target crash rate < 1%
- OTP delivery: cek `otp_delivery_log` di Supabase — target success > 95%
- Admin dashboard: pantau MAU, Fonnte usage, Stream MAU

---

## Update PROGRESS.md — Sesi Terakhir Mobile

```
Tandai semua MO-8 yang selesai.
Di "Keputusan Teknis" catat:
- URL Privacy Policy yang dipakai
- Versi APK/AAB yang diupload
- Tanggal launch beta
- Hasil E2E test (pass/fail per skenario)

Commit: "chore(mo): beta launch prep — privacy + E2E + build"
Tag: git tag -a mo-v0.1.0-beta -m "Mobile beta launch"
Push: git push origin --tags
```

---

*Semua prompt mobile selesai: MO-0 → MO-8*
