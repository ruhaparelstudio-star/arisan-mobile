# BLOCKER — Supabase Credentials Belum Diisi

**Severity:** Kritis  
**Status:** Perlu tindakan manual developer  
**File:** `.env.production` (dibuat dari `.env.production.example`)

## Masalah

File `.env.production.example` masih menggunakan placeholder:
```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Tanpa nilai nyata, dua fitur kritis mati total di production build:

| Fitur | File | Dampak |
|-------|------|--------|
| Chat realtime | `src/api/chat.ts` | `supabase = null` → subscribeMessages tidak bekerja |
| Payment realtime | `src/hooks/usePaymentRealtime.ts` | `supabase = null` → status bayar tidak update live |

## Langkah Fix

### 1. Ambil credentials dari Supabase Dashboard
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → Project kamu
2. **Settings → API**:
   - `Project URL` → untuk `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public` key → untuk `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 2. Buat file .env.production
```bash
cp .env.production.example .env.production
# Edit .env.production dengan nilai nyata:
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Tambahkan ke EAS Environment Variables (opsional, lebih aman)
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxx.supabase.co" --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --environment production
```

### 4. Verifikasi setelah build
Setelah install APK production, buka ChatScreen dan kirim pesan — pesan harus muncul tanpa pull-to-refresh.

## Variabel Lain yang Perlu Diisi

| Variabel | Nilai | Keterangan |
|----------|-------|-----------|
| `EXPO_PUBLIC_SUPPORT_WA` | `628xxxxxxxxxx` | Nomor WA support asli (format 62) |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | `https://arisan.app/privacy` | URL kebijakan privasi live |
| `EXPO_PUBLIC_PLAYSTORE_URL` | URL Play Store | Aktif setelah app dipublish |

## Catatan Keamanan
`EXPO_PUBLIC_*` variables di-bundle ke dalam APK dan bisa diekstrak. Supabase anon key ini aman untuk di-bundle karena:
1. Ini bukan service role key (tidak bisa bypass RLS)
2. Supabase Row Level Security (RLS) melindungi data
3. Pastikan RLS sudah aktif di semua tabel kecuali `messages` (sengaja terbuka untuk MVP)
