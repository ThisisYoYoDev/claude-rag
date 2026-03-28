---
name: context-recall
description: >
  Search past conversations and tool results for relevant historical context.
  Use when the user references past work ("how did we do X", "remember when",
  "last time"), asks about project history, or when historical context from
  previous sessions would help with the current task.
user-invocable: false
allowed-tools: mcp__plugin_claude-rag_rag__search
---

# Context Recall (Auto-invoked by Claude)

Search the RAG database for context relevant to the current conversation.

## Instructions

1. Determine the best search query from the current conversation context.
   Focus on:
   - Specific technical terms, function names, file paths
   - The core topic or problem being discussed
   - Any explicit references to past work

2. Use `mcp__plugin_claude-rag_rag__search` with:
   - query: derived from the conversation context
   - limit: 5
   - threshold: 0.55

3. Return findings concisely:
   - Lead with the most relevant finding
   - Include specific details: file paths, function names, dates
   - If code was found, include key snippets
   - Keep it brief — this is supplementary context, not the main answer
   - Prefix findings with "From past conversations:" to make the source clear

4. If no relevant results found, don't force it.
   Simply state that no relevant historical context was found.
