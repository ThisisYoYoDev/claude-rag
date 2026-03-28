---
description: Restore soft-deleted data in the RAG database — undo a previous forget/delete operation
allowed-tools: mcp__plugin_claude-rag_rag__restore, mcp__plugin_claude-rag_rag__browse_projects, AskUserQuestion
---

# RAG Restore

Restore soft-deleted data: "$ARGUMENTS"

1. If project ID given → use `mcp__plugin_claude-rag_rag__restore` directly
2. Otherwise list projects and ask user which to restore
3. After restore, confirm data is back
