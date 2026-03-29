---
description: Identify technical debt — churn hotspots, TODO markers, recurring errors, and debt score
allowed-tools: mcp__plugin_claude-rag_rag__debt, mcp__plugin_claude-rag_rag__mistakes
---

# Tech Debt Analysis

Analyze technical debt: "$ARGUMENTS"

1. Use `debt` to get the overall debt report (hotspots, markers, recurring errors, score)
2. Use `mistakes` to find error→fix patterns that may indicate fragile code
3. Synthesize findings into actionable recommendations

Present the most critical items first, with specific file paths and suggested actions.
