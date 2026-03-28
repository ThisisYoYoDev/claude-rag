---
description: Configure the Claude RAG plugin — connection, capture settings, RAG mode, privacy, and more
allowed-tools: Bash(*), Read, Edit, Write, mcp__plugin_claude-rag_rag__health, AskUserQuestion
---

# RAG Configuration

Configure: "$ARGUMENTS"

1. Read current config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{}'
   ```

2. If argument matches a section, go there. Otherwise main menu.

## Main Menu (AskUserQuestion)
- "Connection — endpoint & API key"
- "Capture — what to record"
- "RAG Mode — auto injection behavior"
- "Privacy — secret redaction"
- "Show current config"
- "Reset to defaults"
- "Test connection" (uses `mcp__plugin_claude-rag_rag__health`)

## Connection
Local or Cloud? If Cloud: endpoint + API key.

## Capture (multiSelect)
User prompts / AI outputs / Tool calls / Tool results / Sub-agents / Multimodal

## RAG Mode
Off / Manual / Auto (recommended) / Aggressive
+ threshold and max tokens settings

## Privacy (multiSelect)
Redact secrets / Exclude .env / Exclude credentials

Config path: `~/.claude/plugins/claude-rag/config.json`
