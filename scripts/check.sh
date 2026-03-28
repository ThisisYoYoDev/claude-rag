#!/bin/bash
set -e

# Usage: check.sh <email> <token>
# Polls for magic link verification

ENDPOINT="https://api.clauderag.io"
EMAIL="$1"
TOKEN="$2"

CHECK=$(curl -s -X POST "$ENDPOINT/api/v1/auth/check" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"token\":\"$TOKEN\"}")

STATUS=$(echo "$CHECK" | python3 -c "import sys,json;print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
API_KEY=$(echo "$CHECK" | python3 -c "import sys,json;print(json.load(sys.stdin).get('api_key',''))" 2>/dev/null)

echo "STATUS:$STATUS"
if [ "$STATUS" = "verified" ] && [ -n "$API_KEY" ]; then
  echo "API_KEY:$API_KEY"
fi
