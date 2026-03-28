---
description: Ask a question about past work and get a synthesized answer informed by conversation history from the RAG database
allowed-tools: mcp__plugin_claude-rag_rag__search
---

# RAG Ask

Answer the user's question using RAG context: "$ARGUMENTS"

1. Use `mcp__plugin_claude-rag_rag__search` with the question as query, threshold 0.4, limit 10
2. Synthesize an answer from the results:
   - Combine information from multiple results
   - Cite sessions and dates
   - Include code snippets if found
   - Mention which agent found what
3. If insufficient context: say so clearly and offer to answer from general knowledge
