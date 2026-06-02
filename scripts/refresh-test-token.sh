#!/bin/bash
# Refresh EXPO_PUBLIC_TEST_JWT di .env
# Jalankan saat token expired (~30 hari) sebelum Test Lab run
set -e

API="https://arisan-api.vercel.app"
PHONE="+628560000100"
OTP="123456"

echo "Refreshing test JWT..."

curl -s -X POST "$API/api/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}" > /dev/null

TOKEN=$(curl -s -X POST "$API/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$OTP\"}" | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

if [ -z "$TOKEN" ]; then
  echo "ERROR: Gagal mendapatkan token"
  exit 1
fi

if grep -q "EXPO_PUBLIC_TEST_JWT" .env; then
  sed -i "s|EXPO_PUBLIC_TEST_JWT=.*|EXPO_PUBLIC_TEST_JWT=$TOKEN|g" .env
else
  echo "EXPO_PUBLIC_TEST_JWT=$TOKEN" >> .env
fi

echo "Token berhasil diperbarui di .env"
echo "Selanjutnya rebuild APK: cd android && ./gradlew assembleRelease"
