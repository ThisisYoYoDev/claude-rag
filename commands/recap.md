---
description: Get a summary of recent sessions — what was done, which files were touched, key decisions, and insights
allowed-tools: mcp__plugin_claude-rag_rag__browse_sessions, mcp__plugin_claude-rag_rag__timeline, mcp__plugin_claude-rag_rag__search, mcp__plugin_claude-rag_rag__stats
---

# RAG Recap

Generate a recap of recent work: "$ARGUMENTS"

## Steps

1. Use `stats` to get an overview (total events, sessions, projects)
2. Use `browse_sessions` to list recent sessions (limit: 5-10)
3. For each interesting session, use `timeline` to see what happened
4. If the user specified a topic or date range, use `search` to find relevant events

## Output format

Write a concise recap with:
- **Summary**: 2-3 sentences of what happened overall
- **Sessions**: list each session with its key activity (what was asked, what was built/fixed)
- **Files touched**: most frequently interacted files
- **Key decisions**: any notable choices or trade-offs found
- **Insights**: patterns noticed (e.g. "session #3 used 3x more tokens than average", "auth-related work dominated this week")

Keep it concise and actionable. If "$ARGUMENTS" is empty, recap the last 5 sessions.
