#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Firebase Test Lab + Maestro — Arisan App E2E
# ─────────────────────────────────────────────────────────
# Usage:
#   ./firebase_testlab.sh <path/to/app-debug.apk>
#
# Prereqs:
#   1. firebase CLI terinstall & login: firebase login
#   2. gcloud CLI terinstall & auth: gcloud auth login
#   3. Set FIREBASE_PROJECT_ID di bawah atau via env
#   4. APK debug sudah dibangun (lihat bagian BUILD APK)
#
# BUILD APK:
#   APP_ENV=production npx expo run:android --variant debug --device
#   APK output: android/app/build/outputs/apk/debug/app-debug.apk
# ─────────────────────────────────────────────────────────

set -e

FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-arisan-prod}"
APK_PATH="${1:-android/app/build/outputs/apk/debug/app-debug.apk}"
FLOW_DIR="$(dirname "$0")"
RESULTS_DIR="gs://${FIREBASE_PROJECT_ID}.appspot.com/maestro-results/$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK tidak ditemukan: $APK_PATH"
  echo "   Jalankan build dulu:"
  echo "   APP_ENV=production npx expo run:android --variant debug"
  exit 1
fi

echo "🚀 Upload APK ke Firebase Test Lab..."
echo "   APK : $APK_PATH"
echo "   Flow: $FLOW_DIR/flow_smoke.yaml"
echo "   Hasil: $RESULTS_DIR"
echo ""

# Firebase Test Lab dengan Robo Script (approach 1: Robo)
# Maestro flow dijalankan sebagai game loop / instrumentation test
# ─────────────────────────────────────────────────────────
# APPROACH 1: Robo test (paling simple — tanpa Maestro custom runner)
# ─────────────────────────────────────────────────────────
gcloud firebase test android run \
  --type robo \
  --app "$APK_PATH" \
  --device model=MediumPhone.arm,version=34,locale=id,orientation=portrait \
  --results-bucket "${FIREBASE_PROJECT_ID}.appspot.com" \
  --results-dir "maestro-results/$(date +%Y%m%d-%H%M%S)" \
  --project "$FIREBASE_PROJECT_ID" \
  --timeout 10m \
  --robo-directives \
    "text:phone_input=8560000100,text:otp_input_0=1,text:otp_input_1=2,text:otp_input_2=3,text:otp_input_3=4,text:otp_input_4=5,text:otp_input_5=6" \
  2>&1

echo ""
echo "✅ Test selesai. Lihat hasil di:"
echo "   https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/testlab"
