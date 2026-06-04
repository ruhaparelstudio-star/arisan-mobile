#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# Jalankan Maestro tests di device lokal yang terhubung
# ─────────────────────────────────────────────────────────
# Usage:
#   ./run_local.sh             # smoke test
#   ./run_local.sh full        # full E2E
#   ./run_local.sh auth        # hanya auth flow

set -e

export PATH="$HOME/.maestro/bin:$PATH"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Pastikan device terhubung
if ! adb devices | grep -q "device$"; then
  echo "❌ Tidak ada device Android terhubung."
  echo "   Sambungkan device via USB dan aktifkan USB Debugging."
  exit 1
fi

MODE="${1:-smoke}"

case "$MODE" in
  smoke)
    echo "🧪 Menjalankan Smoke Test..."
    maestro test "$SCRIPT_DIR/flow_smoke.yaml" \
      --format junit \
      --output "$SCRIPT_DIR/results/smoke_$(date +%Y%m%d-%H%M%S).xml"
    ;;
  full)
    echo "🧪 Menjalankan Full E2E Test..."
    maestro test "$SCRIPT_DIR/flow_full.yaml" \
      --format junit \
      --output "$SCRIPT_DIR/results/full_$(date +%Y%m%d-%H%M%S).xml"
    ;;
  auth)
    echo "🧪 Menjalankan Auth Tests..."
    maestro test "$SCRIPT_DIR/auth/" \
      --format junit \
      --output "$SCRIPT_DIR/results/auth_$(date +%Y%m%d-%H%M%S).xml"
    ;;
  *)
    echo "Usage: $0 [smoke|full|auth]"
    exit 1
    ;;
esac

echo ""
echo "✅ Test selesai!"
echo "   Hasil XML tersimpan di: $SCRIPT_DIR/results/"
