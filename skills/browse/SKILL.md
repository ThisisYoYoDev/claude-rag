---
name: browse
description: Browse past sessions, projects, and their events in the RAG database
disable-model-invocation: true
allowed-tools: Bash(curl *)
argument-hint: "[session-id or project-name]"
---

# RAG Browse

Browse past sessions and events: "$ARGUMENTS"

## Instructions

1. Read the plugin config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. Determine what the user wants to browse:

### No argument → List recent sessions
```bash
curl -s <endpoint>/api/v1/sessions?limit=10
```
Display as a table:
| # | Session | Project | Events | Started |
Show session IDs so the user can drill down.

### UUID argument → Session detail
```bash
curl -s <endpoint>/api/v1/sessions/<id>
```
Show:
- Session name, project, model, duration
- Agent breakdown (main + sub-agents)
- Event stats by type (prompts, tools, outputs)
- Tool usage breakdown

Then:
```bash
curl -s "<endpoint>/api/v1/sessions/<id>/events?limit=20"
```
Show timeline of events with content previews.

### Text argument → Search by project name
```bash
curl -s <endpoint>/api/v1/projects
```
Find matching project, then list its sessions.

3. Always offer next actions:
   - "Use `/claude-rag:browse <session-id>` to see session details"
   - "Use `/claude-rag:search <query>` to search within results"
