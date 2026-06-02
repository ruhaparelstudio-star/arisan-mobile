#!/bin/bash
# Firebase Test Lab — Robo Test
# Jalankan dari root project: bash scripts/firebase-test-lab.sh
set -e

FIREBASE_PROJECT="arisan-app-5ecef"
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
RESULTS_BUCKET="gs://${FIREBASE_PROJECT}.appspot.com/test-lab"

echo "======================================"
echo " Firebase Test Lab — Arisan App"
echo "======================================"

# 1. Cek gcloud sudah login
if ! gcloud auth print-access-token &>/dev/null; then
  echo "[ERROR] Belum login ke gcloud."
  echo "Jalankan dulu: gcloud auth login"
  exit 1
fi

# 2. Set project
gcloud config set project "$FIREBASE_PROJECT" --quiet

# 3. Build release APK
echo ""
echo "[1/3] Build release APK..."
cd android
./gradlew assembleRelease --quiet
cd ..
echo "APK siap: $APK_PATH ($(du -sh $APK_PATH | cut -f1))"

# 4. Jalankan Robo Test
echo ""
echo "[2/3] Upload APK & mulai Robo Test di Firebase Test Lab..."
echo "      Device: Pixel2 (Android 10) + Pixel6 (Android 13)"
echo ""

gcloud firebase test android run \
  --type robo \
  --app "$APK_PATH" \
  --device model=Pixel2,version=29,locale=id,orientation=portrait \
  --device model=Pixel6,version=33,locale=id,orientation=portrait \
  --robo-directives click:com.arisan.app:btn_mulai=,text:com.arisan.app:input_phone=081234567890 \
  --timeout 5m \
  --results-bucket "$RESULTS_BUCKET" \
  --results-dir "robo-$(date +%Y%m%d-%H%M%S)" \
  --project "$FIREBASE_PROJECT"

echo ""
echo "[3/3] Selesai. Lihat hasil di:"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/testlab/histories"
