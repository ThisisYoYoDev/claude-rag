---
name: stats
description: Show RAG database statistics — events, embeddings, chunks, projects, tools, languages
disable-model-invocation: true
allowed-tools: Bash(curl *)
---

# RAG Statistics

## Instructions

1. Read the plugin config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. Fetch stats from the backend:
   ```bash
   curl -s <endpoint>/api/v1/stats
   ```

3. Display a comprehensive dashboard:

### Overview
| Metric | Value |
|--------|-------|
| Total Events | X |
| Total Embeddings | X |
| Total Chunks | X (avg Y per event) |
| Sessions | X |
| Projects | X |
| Pending Embeddings | X |

### By Content Type
Show bar chart (ascii) of user_prompt, ai_output, tool_call, tool_result, error

### Top Tools
Ranked list of most used tools with counts

### Languages Detected
List of programming languages found in indexed code

### Projects
Table with project name, session count, event count

### Recent Sessions
Last 5 sessions with name, project, event count, date

4. If pending_embeddings > 0, mention that some events are still being processed.
