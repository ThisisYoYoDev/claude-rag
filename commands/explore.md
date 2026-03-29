---
description: Explore code using RAG history — find how functions evolved, what errors occurred, and what decisions were made about specific code
allowed-tools: mcp__plugin_claude-rag_rag__code_search, mcp__plugin_claude-rag_rag__code_history, mcp__plugin_claude-rag_rag__detail, mcp__plugin_claude-rag_rag__turn, mcp__plugin_claude-rag_rag__search
---

# RAG Code Explorer

Explore: "$ARGUMENTS"

## Steps

1. Use `code_search` to find relevant code interactions (edits, reads, discussions)
2. Use `code_history` to trace the evolution of specific files
3. Use `detail` or `turn` to read full context of interesting findings
4. Use `search` for broader context (discussions, decisions, error patterns)

## What to look for

- How has this code changed over time?
- What bugs or errors have occurred here?
- What design decisions were made and why?
- Who/what sessions touched this code?
- Are there related files that always change together?

Present findings chronologically, highlighting the key moments in this code's history.
