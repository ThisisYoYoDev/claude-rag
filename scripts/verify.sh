#!/bin/bash
set -e

# Usage: verify.sh <email> <code>
# Verifies the 6-digit code and returns the API key

ENDPOINT="https://api.clauderag.io"
EMAIL="$1"
CODE="$2"

if [ -z "$EMAIL" ] || [ -z "$CODE" ]; then
  echo "ERROR:missing_args"
  exit 1
fi

VERIFY=$(curl -s -X POST "$ENDPOINT/api/v1/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}")

STATUS=$(echo "$VERIFY" | python3 -c "import sys,json;print(json.load(sys.stdin).get('status','error'))" 2>/dev/null)
API_KEY=$(echo "$VERIFY" | python3 -c "import sys,json;print(json.load(sys.stdin).get('api_key',''))" 2>/dev/null)
ERROR=$(echo "$VERIFY" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if [ "$STATUS" = "verified" ] && [ -n "$API_KEY" ]; then
  echo "STATUS:verified"
  echo "API_KEY:$API_KEY"
else
  echo "STATUS:failed"
  echo "ERROR:${ERROR:-Invalid or expired code}"
  exit 1
fi
