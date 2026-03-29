---
description: Review current work against past patterns — find potential regressions, repeated mistakes, or missed edge cases
allowed-tools: mcp__plugin_claude-rag_rag__search, mcp__plugin_claude-rag_rag__code_search, mcp__plugin_claude-rag_rag__code_history, mcp__plugin_claude-rag_rag__detail
---

# RAG Review

Review the current work: "$ARGUMENTS"

## Steps

1. **Understand what changed**: Read the current git diff or recent files to understand what was modified
2. **Search for past issues**: Use `search` and `code_search` to find:
   - Past errors in the same files or areas
   - Previous bug fixes that might be affected
   - Related discussions or decisions
3. **Check file history**: Use `code_history` on modified files to see past patterns
4. **Expand relevant findings**: Use `detail` to read full context of concerning past events

## Output format

Write a review with:
- **Changes summary**: what was modified
- **Past context**: relevant history for each changed area
- ⚠️ **Warnings**: potential issues based on past experience
- ✅ **Looks good**: areas that follow established patterns
- 💡 **Suggestions**: improvements based on past learnings
