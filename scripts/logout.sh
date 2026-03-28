#!/bin/bash
set -e

CONFIG_FILE="$HOME/.claude/plugins/claude-rag/config.json"
SETTINGS_FILE="$HOME/.claude/settings.json"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Non-interactive — confirmation handled by Claude via AskUserQuestion

# Revoke keys
if [ -f "$CONFIG_FILE" ]; then
  ENDPOINT=$(python3 -c "import json;print(json.load(open('$CONFIG_FILE')).get('connection',{}).get('endpoint',''))" 2>/dev/null)
  API_KEY=$(python3 -c "import json;print(json.load(open('$CONFIG_FILE')).get('connection',{}).get('apiKey',''))" 2>/dev/null)

  if [ -n "$API_KEY" ] && [ -n "$ENDPOINT" ]; then
    echo -e "${BLUE}→ Revoking API keys...${NC}"
    curl -s "$ENDPOINT/api/v1/auth/keys" -H "Authorization: Bearer $API_KEY" 2>/dev/null | \
      python3 -c "import sys,json;[print(k['id']) for k in json.load(sys.stdin).get('keys',[])]" 2>/dev/null | \
      while read KEY_ID; do
        curl -s -X DELETE "$ENDPOINT/api/v1/auth/keys/$KEY_ID" -H "Authorization: Bearer $API_KEY" >/dev/null 2>&1
      done
    echo -e "${GREEN}✓ Keys revoked${NC}"
  fi

  echo '{}' > "$CONFIG_FILE"
  echo -e "${GREEN}✓ Config cleared${NC}"
fi

# Remove permissions
if [ -f "$SETTINGS_FILE" ]; then
  python3 -c "
import json
with open('$SETTINGS_FILE') as f: s = json.load(f)
allow = s.get('permissions',{}).get('allow',[])
s['permissions']['allow'] = [a for a in allow if 'claude-rag' not in a]
with open('$SETTINGS_FILE','w') as f: json.dump(s, f, indent=2)
"
  echo -e "${GREEN}✓ Permissions removed${NC}"
fi

echo ""
echo -e "Logged out. Run ${BOLD}/claude-rag:setup${NC} to reconnect."
echo ""
