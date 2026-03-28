#!/bin/bash
set -e

# Usage: setup.sh <email> [name]
# Non-interactive — all inputs via arguments

ENDPOINT="https://api.clauderag.io"
CONFIG_DIR="$HOME/.claude/plugins/claude-rag"
CONFIG_FILE="$CONFIG_DIR/config.json"
SETTINGS_FILE="$HOME/.claude/settings.json"
EMAIL="$1"
NAME="${2:-$EMAIL}"

if [ -z "$EMAIL" ]; then
  echo "ERROR:no_email"
  exit 1
fi

# Step 1: Check Bun
if ! command -v bun &>/dev/null; then
  echo "STEP:installing_bun"
  curl -fsSL https://bun.sh/install | bash 2>&1
  export PATH="$HOME/.bun/bin:$PATH"
fi

# Step 2: Send magic link
echo "STEP:registering"
REGISTER=$(curl -s -X POST "$ENDPOINT/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"$NAME\"}")

STATUS=$(echo "$REGISTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('status','error'))" 2>/dev/null)
SENT=$(echo "$REGISTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('email_sent',False))" 2>/dev/null)
TOKEN=$(echo "$REGISTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
ERROR=$(echo "$REGISTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if [ -n "$ERROR" ] && [ "$ERROR" != "" ] && [ "$ERROR" != "None" ]; then
  echo "ERROR:$ERROR"
  exit 1
fi

echo "STEP:email_sent:$SENT"
echo "TOKEN:$TOKEN"
echo "ACCOUNT:$(echo "$REGISTER" | python3 -c "import sys,json;print(json.load(sys.stdin).get('account','new'))" 2>/dev/null)"
