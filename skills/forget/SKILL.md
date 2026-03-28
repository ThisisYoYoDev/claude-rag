---
name: forget
description: Soft-delete data from the RAG database — by session, project, or all. Data can be restored later.
disable-model-invocation: true
allowed-tools: Bash(curl *), AskUserQuestion
argument-hint: "[session-id | project-name | all]"
---

# RAG Forget (Soft Delete)

Delete data from the RAG database. Data is soft-deleted and can be restored.

## Instructions

1. Read the plugin config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. Determine scope from "$ARGUMENTS":

### No argument → Ask the user
Use AskUserQuestion:
- question: "What do you want to forget?"
- options: ["A specific session", "An entire project", "Everything"]

### "all" → Confirm then delete all projects
**Always confirm first** with AskUserQuestion:
- question: "This will soft-delete ALL your RAG data. Are you sure?"
- options: ["Yes, delete everything", "No, cancel"]

If confirmed, list all projects and delete each:
```bash
curl -s <endpoint>/api/v1/projects
# For each project:
curl -s -X DELETE <endpoint>/api/v1/projects/<id>
```

### Session ID (UUID) → Delete that session
```bash
curl -s -X DELETE <endpoint>/api/v1/sessions/<id>
```

### Project name → Find and delete project
```bash
curl -s <endpoint>/api/v1/projects
# Find matching project, then:
curl -s -X DELETE <endpoint>/api/v1/projects/<id>
```

3. After deletion, show:
   - What was deleted (session name, project name, event counts)
   - Remind: "Data is soft-deleted and can be restored with `/claude-rag:restore`"

4. **Never hard-delete. Always use the DELETE endpoints which perform soft-delete.**
