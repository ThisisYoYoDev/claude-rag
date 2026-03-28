#!/bin/bash
set -e

ENDPOINT="https://api.clauderag.io"
CONFIG_DIR="$HOME/.claude/plugins/claude-rag"
CONFIG_FILE="$CONFIG_DIR/config.json"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   Claude RAG — Login                 ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""

# Detect email
EMAIL=$(git config --global user.email 2>/dev/null || echo "")

if [ -n "$EMAIL" ]; then
  echo -e "${BLUE}Detected:${NC} $EMAIL"
  read -p "Use this email? (Y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    read -p "Enter your email: " EMAIL
  fi
else
  read -p "Enter your email: " EMAIL
fi

[ -z "$EMAIL" ] && echo -e "${RED}✗ No email${NC}" && exit 1

# Send magic link
echo -e "${BLUE}→ Sending verification email...${NC}"
R=$(curl -s -X POST "$ENDPOINT/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")

ERROR=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if [ -n "$ERROR" ] && [ "$ERROR" != "" ]; then
  echo -e "${RED}✗ $ERROR${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Email sent!${NC}"
TOKEN=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

# Get code
echo ""
read -p "6-digit code (or press Enter if you clicked the link): " CODE

if [ -z "$CODE" ]; then
  R=$(curl -s -X POST "$ENDPOINT/api/v1/auth/check" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"token\":\"$TOKEN\"}")
else
  R=$(curl -s -X POST "$ENDPOINT/api/v1/auth/verify" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}")
fi

STATUS=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
API_KEY=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('api_key',''))" 2>/dev/null)

if [ "$STATUS" != "verified" ] || [ -z "$API_KEY" ]; then
  echo -e "${RED}✗ Verification failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Verified!${NC}"

# Update config
mkdir -p "$CONFIG_DIR"
if [ -f "$CONFIG_FILE" ]; then
  python3 -c "
import json
with open('$CONFIG_FILE') as f: c = json.load(f)
c.setdefault('connection',{})['apiKey'] = '$API_KEY'
c['connection']['endpoint'] = '$ENDPOINT'
with open('$CONFIG_FILE','w') as f: json.dump(c, f, indent=2)
"
else
  echo "{\"connection\":{\"endpoint\":\"$ENDPOINT\",\"apiKey\":\"$API_KEY\"}}" | python3 -m json.tool > "$CONFIG_FILE"
fi

echo -e "${GREEN}✓ Config updated${NC}"
echo ""
echo -e "  Logged in as ${GREEN}$EMAIL${NC}"
echo ""
