#!/bin/bash
set -e

# Usage: save-config.sh <api_key>
# Writes the plugin config and adds permissions

ENDPOINT="https://api.clauderag.io"
API_KEY="$1"
CONFIG_DIR="$HOME/.claude/plugins/claude-rag"
CONFIG_FILE="$CONFIG_DIR/config.json"
SETTINGS_FILE="$HOME/.claude/settings.json"

if [ -z "$API_KEY" ]; then
  echo "ERROR:no_api_key"
  exit 1
fi

# Write config
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" << CONF
{
  "connection": {"endpoint": "$ENDPOINT", "apiKey": "$API_KEY"},
  "capture": {
    "enabled": true, "userPrompts": true, "aiOutputs": true,
    "toolCalls": true, "toolResults": true, "subAgents": true,
    "multimodal": {"copyFiles": true, "maxFileSize": "50MB"},
    "exclude": {"tools": ["AskUserQuestion"], "pathPatterns": []}
  },
  "rag": {
    "mode": "auto", "threshold": 0.6, "maxContextTokens": 5000,
    "perPrompt": {"enabled": true, "maxItems": 5, "maxLatencyMs": 500},
    "sessionStart": {"enabled": true, "maxItems": 3}
  },
  "privacy": {"redactSecrets": false, "excludePatterns": []}
}
CONF
echo "CONFIG:written"

# Add permissions
TOOLS='["mcp__plugin_claude-rag_rag__search","mcp__plugin_claude-rag_rag__stats","mcp__plugin_claude-rag_rag__browse_sessions","mcp__plugin_claude-rag_rag__browse_projects","mcp__plugin_claude-rag_rag__forget","mcp__plugin_claude-rag_rag__restore","mcp__plugin_claude-rag_rag__health","mcp__plugin_claude-rag_rag__login","mcp__plugin_claude-rag_rag__setup"]'

if [ -f "$SETTINGS_FILE" ]; then
  python3 -c "
import json
with open('$SETTINGS_FILE') as f: s = json.load(f)
tools = $TOOLS
perms = s.setdefault('permissions', {})
allow = perms.setdefault('allow', [])
for t in tools:
  if t not in allow: allow.append(t)
with open('$SETTINGS_FILE', 'w') as f: json.dump(s, f, indent=2)
print('PERMS:merged')
"
else
  echo '{"permissions":{"allow":'"$TOOLS"'}}' | python3 -m json.tool > "$SETTINGS_FILE"
  echo "PERMS:created"
fi
