#!/bin/bash
# AiProve auth via curl (robust) + Node offline signing.
# Usage: bash auth.sh   -> writes ./token mode 0600, prints token prefix + expiry only.
set -euo pipefail
cd "$(dirname "$0")"
API="https://aiprove.fun"
ADDR="0x3fcb8b7d5ca1b5f29524bc960612c4ae20716960"
echo "address: $ADDR"
CHALLENGE=""
for i in 1 2 3; do
  CHALLENGE=$(curl -s --max-time 20 "$API/api/auth/challenge?address=$ADDR" | python3 -c "import sys,json; print(json.load(sys.stdin).get('challenge',''))" 2>/dev/null || true)
  [ -n "$CHALLENGE" ] && break
  echo "challenge attempt $i failed, retrying..."
  sleep 2
done
[ -n "$CHALLENGE" ] || { echo "ERROR: no challenge after 3 attempts"; exit 1; }
echo "challenge received, len: ${#CHALLENGE}"
SIG=$(node sign.mjs "$CHALLENGE")
RESP=""
for i in 1 2 3; do
  RESP=$(curl -s --max-time 20 -X POST "$API/api/auth/verify" -H 'content-type: application/json' -d "{\"address\":\"$ADDR\",\"signature\":\"$SIG\"}" || true)
  echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('token'); print('ok')" 2>/dev/null && break
  echo "verify attempt $i failed: $(echo "$RESP" | head -c 200)"
  sleep 2
  RESP=""
done
[ -n "$RESP" ] || { echo "ERROR: verify failed after 3 attempts"; exit 1; }
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
EXPIRES=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('expiresAt',''))")
printf '%s' "$TOKEN" > ./token
chmod 600 ./token
echo "token saved to ./token (0600), prefix: ${TOKEN:0:12}..., len: ${#TOKEN}, expiresAt: $EXPIRES"
