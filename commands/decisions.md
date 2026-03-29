---
description: Browse architectural decisions detected in past conversations — what was chosen, why, and when
allowed-tools: mcp__plugin_claude-rag_rag__decisions, mcp__plugin_claude-rag_rag__detail
---

# Decision Journal

List architectural decisions: "$ARGUMENTS"

1. Use `decisions` to fetch auto-tagged decisions from past AI outputs
2. If the user asks about a specific decision, use `detail` with the event ID to get full context

Present decisions chronologically with project, date, and a summary of what was decided and why.
