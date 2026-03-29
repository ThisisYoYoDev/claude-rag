---
description: Create an implementation plan informed by past sessions — learns from history to avoid past mistakes and reuse proven patterns
allowed-tools: mcp__plugin_claude-rag_rag__search, mcp__plugin_claude-rag_rag__code_search, mcp__plugin_claude-rag_rag__code_history, mcp__plugin_claude-rag_rag__detail, mcp__plugin_claude-rag_rag__turn
---

# RAG-Informed Plan

Create a plan for: "$ARGUMENTS"

## Steps

1. **Search history**: Use `search` to find past sessions related to this task. Look for:
   - Similar tasks that were done before
   - Errors or bugs encountered in related code
   - Patterns that worked well

2. **Check code history**: Use `code_search` and `code_history` to find:
   - Files that will likely be touched
   - Past modifications and their outcomes
   - Known issues in those areas

3. **Expand relevant results**: Use `detail` or `turn` to read full context of the most relevant past events

4. **Generate the plan** incorporating lessons learned:
   - What to do (step by step)
   - What to watch out for (based on past errors)
   - Which files to modify (based on history)
   - Which patterns to reuse (based on past successes)

## Output format

Write a numbered plan with:
- Each step clearly described
- Warnings from past sessions marked with ⚠️
- Reusable patterns marked with ✅
- File paths that will need changes
