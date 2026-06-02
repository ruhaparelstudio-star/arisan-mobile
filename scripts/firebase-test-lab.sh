#!/bin/bash
# Firebase Test Lab — Robo Test (Android + iOS)
#
# CARA PAKAI:
#   bash scripts/firebase-test-lab.sh <API_URL>
#
# Contoh (ngrok):
#   bash scripts/firebase-test-lab.sh https://abc123.ngrok.io
#
# Contoh (server production):
#   bash scripts/firebase-test-lab.sh https://api.arisan.app
#
set -e

FIREBASE_PROJECT="arisan-app-5ecef"
API_URL="${1:-}"
RESULTS_DIR="robo-$(date +%Y%m%d-%H%M%S)"

echo "======================================"
echo " Firebase Test Lab — Arisan App"
echo "======================================"

# 1. Cek gcloud sudah login
if ! gcloud auth print-access-token &>/dev/null; then
  echo "[ERROR] Belum login ke gcloud."
  echo "Jalankan dulu: gcloud auth login"
  exit 1
fi

# 2. Cek API_URL
if [ -z "$API_URL" ]; then
  echo "[ERROR] API_URL wajib diisi."
  echo ""
  echo "Cara expose backend lokal dengan ngrok:"
  echo "  1. Install: npm install -g ngrok"
  echo "  2. Jalankan backend: cd arisan-api && npm run dev"
  echo "  3. Expose: ngrok http 3001"
  echo "  4. Copy URL ngrok (contoh: https://abc123.ngrok.io)"
  echo "  5. Jalankan: bash scripts/firebase-test-lab.sh https://abc123.ngrok.io"
  exit 1
fi

echo "API URL: $API_URL"
gcloud config set project "$FIREBASE_PROJECT" --quiet

# 3. Update .env dengan API URL yang bisa diakses dari internet
echo ""
echo "[1/4] Update .env dengan API URL..."
cp .env .env.backup
sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$API_URL|g" .env
echo "      EXPO_PUBLIC_API_URL=$API_URL"

# 4. Build Android release APK
echo ""
echo "[2/4] Build Android release APK..."
cd android
./gradlew assembleRelease --quiet
cd ..
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
echo "      APK: $APK_PATH ($(du -sh $APK_PATH | cut -f1))"

# 5. Restore .env
cp .env.backup .env && rm .env.backup
echo "      .env restored"

# 6. Jalankan Robo Test — Android
echo ""
echo "[3/4] Firebase Test Lab — Android (Pixel2.arm + Pixel6)..."
gcloud firebase test android run \
  --type robo \
  --app "$APK_PATH" \
  --robo-script scripts/robo-script.json \
  --device model=Pixel2.arm,version=29,locale=in_ID,orientation=portrait \
  --device model=oriole,version=33,locale=in_ID,orientation=portrait \
  --timeout 8m \
  --results-dir "${RESULTS_DIR}-android" \
  --project "$FIREBASE_PROJECT"

# 7. iOS — cek IPA tersedia
echo ""
echo "[4/4] iOS Test Lab..."
IPA_PATH="$(find . -name '*.ipa' 2>/dev/null | head -1)"
if [ -z "$IPA_PATH" ]; then
  echo "      [SKIP] IPA belum tersedia."
  echo "      Untuk build IPA, jalankan:"
  echo "        npx eas-cli build --platform ios --profile test-lab"
  echo "      Perlu: akun Expo + Apple Developer account"
  echo ""
  echo "      Setelah IPA tersedia, jalankan manual:"
  echo "        gcloud firebase test ios run \\"
  echo "          --test IPA_PATH \\"
  echo "          --device model=iphone14pro,version=16 \\"
  echo "          --project $FIREBASE_PROJECT"
else
  echo "      IPA ditemukan: $IPA_PATH"
  gcloud firebase test ios run \
    --test "$IPA_PATH" \
    --device model=iphone14pro,version=16 \
    --timeout 8m \
    --results-dir "${RESULTS_DIR}-ios" \
    --project "$FIREBASE_PROJECT"
fi

echo ""
echo "Hasil test:"
echo "https://console.firebase.google.com/project/${FIREBASE_PROJECT}/testlab/histories"
