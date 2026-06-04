# BLOCKER — Firebase API Key Terbuka di Repo

**Severity:** Kritis  
**Status:** Perlu tindakan manual developer  
**File:** `google-services.json` (root project)

## Masalah

File `google-services.json` berisi API key nyata dan project credentials Firebase yang ter-commit ke git:

```json
{
  "project_info": { "project_id": "arisan-app-5ecef" },
  "api_key": [{ "current_key": "AIzaSy..." }]
}
```

Key ini dapat:
- Diekstrak dari APK oleh siapapun yang melakukan APK decompile
- Dilihat di git history publik
- Disalahgunakan untuk menguras kuota Firebase (Storage, Crashlytics, Analytics)

## Langkah Fix (Manual Developer)

### 1. Rotate Firebase API Key
1. Buka [Firebase Console](https://console.firebase.google.com) → Project `arisan-app-5ecef`
2. Buka **Project Settings → General → Your apps → Android**
3. Download `google-services.json` baru
4. Di **Google Cloud Console** → APIs & Services → Credentials → hapus key lama

### 2. Tambah ke .gitignore (sudah dilakukan otomatis)
`google-services.json` sudah ditambahkan ke `.gitignore`. File lama di git history tetap terlihat — pertimbangkan `git filter-repo` untuk menghapus history jika repo public.

### 3. Setup EAS Secret
```bash
# Simpan google-services.json baru sebagai EAS Secret
eas secret:create \
  --name GOOGLE_SERVICES_JSON \
  --value "$(cat google-services.json)" \
  --scope project
```

`app.config.js` sudah dikonfigurasi untuk membaca via:
```js
googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
```

### 4. Hapus file lokal setelah setup EAS Secret
```bash
rm google-services.json
```

## Referensi
- `app.config.js` baris 40: `googleServicesFile` config
- `eas.json`: production profile sudah benar
