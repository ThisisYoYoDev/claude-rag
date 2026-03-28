---
description: First-time setup for the Claude RAG plugin — create your free account with email verification
allowed-tools: Bash(*), mcp__plugin_claude-rag_rag__health, AskUserQuestion
---

# Setup Claude RAG

Detect email and config: !`echo "EMAIL:$(git config --global user.email 2>/dev/null || echo 'NONE')" && echo "CONFIG:$(cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo 'NO_CONFIG')"`

## Instructions

1. If CONFIG already has an apiKey, tell user they're set up and verify with `mcp__plugin_claude-rag_rag__health`. Ask to reconfigure. If no → stop.

2. Confirm email with AskUserQuestion (auto-detected above).

3. Register — run this script with the email and name:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup.sh" "<email>" "<name>"
   ```
   Parse output for `TOKEN:` and `STEP:email_sent:`.

4. Tell user to check email. Ask for code with AskUserQuestion.

5. Verify code — run:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/verify.sh" "<email>" "<code>"
   ```
   If failed, try checking magic link:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/check.sh" "<email>" "<token>"
   ```

6. Save config with the API key:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/save-config.sh" "<api_key>"
   ```

7. Test with `mcp__plugin_claude-rag_rag__health`.

8. Show success + commands list. Remind to restart Claude Code.
