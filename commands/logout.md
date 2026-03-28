---
description: Logout from Claude RAG — revoke API key and clear local config
allowed-tools: Bash(*), AskUserQuestion
---

# Logout from Claude RAG

## Instructions

1. Confirm with AskUserQuestion: "Revoke API key and clear config?"

2. If confirmed, run:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/logout.sh"
   ```
   Note: the logout script is non-interactive (no read -p), it just runs.

3. Confirm success.
