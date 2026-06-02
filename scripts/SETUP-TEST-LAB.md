# Setup Firebase Test Lab — Arisan App

## Prasyarat

Firebase project: `arisan-app-5ecef`  
APK: build release (JS sudah di-bundle, tidak butuh Metro)

---

## Langkah 1 — Install gcloud CLI (sekali saja)

Jalankan di terminal WSL:

```bash
# Import GPG key
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

# Tambah apt source
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] \
  https://packages.cloud.google.com/apt cloud-sdk main" \
  | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list

# Install
sudo apt-get update && sudo apt-get install -y google-cloud-cli

# Verifikasi
gcloud --version
```

---

## Langkah 2 — Login & set project (sekali saja)

```bash
gcloud auth login
# Browser akan terbuka, login dengan akun Google yang punya akses Firebase

gcloud config set project arisan-app-5ecef
```

---

## Langkah 3 — Aktifkan Firebase Test Lab API (sekali saja)

```bash
gcloud services enable testing.googleapis.com toolresults.googleapis.com
```

> Atau aktifkan lewat Firebase Console → Test Lab → Get Started

---

## Langkah 4 — Pastikan Firebase plan Blaze

Firebase Test Lab gratis tier: 5 virtual device / 1 physical device per hari.  
Upgrade ke Blaze (pay-as-you-go) jika butuh lebih banyak.

Biaya test lab:
- Virtual device: $1/device-hour
- Physical device: $5/device-hour
- 5 menit test ≈ $0.08 per virtual device

---

## Cara Pakai — Setiap Mau Test

Dari root project (`mobile/`):

```bash
bash scripts/firebase-test-lab.sh
```

Script ini akan:
1. Build release APK otomatis (`./gradlew assembleRelease`)
2. Upload APK ke Firebase
3. Jalankan Robo Test di 2 device (Pixel2 Android 10 + Pixel6 Android 13)
4. Tampilkan link hasil test

Durasi: ~8-12 menit total

---

## Lihat Hasil Test

```
https://console.firebase.google.com/project/arisan-app-5ecef/testlab/histories
```

Hasil include:
- Screenshot tiap screen yang dikunjungi Robo
- Video recording
- Crash logs + stack trace
- ANR detection
- Coverage: % screen yang dijangkau

---

## Device yang Tersedia

Cek device list:
```bash
gcloud firebase test android models list
```

Device populer untuk Indonesia:
| Model | Spek | Version |
|-------|------|---------|
| `Pixel2` | Pixel 2 | 28, 29 |
| `Pixel6` | Pixel 6 | 33 |
| `gts4lltewifi` | Samsung Tab S4 | 28 |
| `OnePlus8` | OnePlus 8 | 31 |

---

## Custom Robo Directives (Opsional)

Edit `scripts/firebase-test-lab.sh`, bagian `--robo-directives`:

```
text:com.arisan.app:input_phone=081234567890   # isi field nomor HP
click:com.arisan.app:btn_mulai=               # klik tombol Mulai
```

> Pakai Android resource ID dari layout XML atau `adb uiautomator dump`.
