---
description: Login to your existing Claude RAG account — sends a magic link to your email
allowed-tools: Bash(*), AskUserQuestion
---

# Login to Claude RAG

Detect email: !`echo "EMAIL:$(git config --global user.email 2>/dev/null || echo 'NONE')"`

## Instructions

1. Confirm email with AskUserQuestion.

2. Send magic link:
   ```bash
   curl -s -X POST "https://api.clauderag.io/api/v1/auth/login" -H "Content-Type: application/json" -d '{"email":"<email>"}'
   ```
   If error "No account found" → tell user to run `/claude-rag:setup`.
   Save the `token` from response.

3. Ask for 6-digit code with AskUserQuestion.

4. Verify:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/verify.sh" "<email>" "<code>"
   ```
   Or check magic link:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/check.sh" "<email>" "<token>"
   ```

5. Save API key:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/save-config.sh" "<api_key>"
   ```

6. Confirm success.
