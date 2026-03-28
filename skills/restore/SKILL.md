---
name: restore
description: Restore soft-deleted data in the RAG database — undo a previous forget/delete operation
disable-model-invocation: true
allowed-tools: Bash(curl *), AskUserQuestion
argument-hint: "[project-name]"
---

# RAG Restore

Restore soft-deleted data from the RAG database.

## Instructions

1. Read the plugin config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. If "$ARGUMENTS" is provided, find and restore that project:
   ```bash
   curl -s -X POST <endpoint>/api/v1/projects/<id>/restore
   ```

3. If no argument, list all projects (including deleted) and let the user choose:
   - First show active projects
   - Then query for deleted projects (this would need a backend endpoint — for now, inform the user to provide the project ID)

4. After restore, show:
   - What was restored (project name, event counts)
   - Confirm data is back in search results

5. Remind: "Restored data will appear in search results again immediately."
