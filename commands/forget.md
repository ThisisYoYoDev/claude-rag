---
description: Soft-delete data from the RAG database — by session, project, or all. Data can be restored later.
allowed-tools: mcp__plugin_claude-rag_rag__forget, mcp__plugin_claude-rag_rag__browse_sessions, mcp__plugin_claude-rag_rag__browse_projects, AskUserQuestion
---

# RAG Forget (Soft Delete)

Soft-delete data from the RAG database. "$ARGUMENTS"

1. **Always confirm** with AskUserQuestion before deleting
2. If no argument: ask what to forget (session or project)
3. List available items with `mcp__plugin_claude-rag_rag__browse_sessions` or `mcp__plugin_claude-rag_rag__browse_projects`
4. Once confirmed, use `mcp__plugin_claude-rag_rag__forget` with scope and ID
5. Remind: data can be restored with `/claude-rag:restore`
