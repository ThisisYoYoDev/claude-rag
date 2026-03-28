---
name: ask
description: Ask a question about past work and get a synthesized answer informed by conversation history from the RAG database
disable-model-invocation: true
allowed-tools: Bash(curl *)
argument-hint: "[question]"
---

# RAG Ask

Answer the user's question using RAG context: "$ARGUMENTS"

## Instructions

1. Read the plugin config to get the backend endpoint:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. Search the RAG database for relevant context:
   ```bash
   curl -s -X POST <endpoint>/api/v1/search \
     -H "Content-Type: application/json" \
     -d '{"query": "<user_question>", "limit": 10, "threshold": 0.4}'
   ```

3. Synthesize an answer based on the search results:
   - Combine information from multiple results to form a coherent answer
   - Cite specific sessions, tools, and dates when referencing past work
   - If the answer comes from code (tool_result from Read), include relevant code snippets
   - If results are from sub-agents, mention which agent type found the information
   - Be transparent about confidence: if results have low scores (<0.5), caveat accordingly

4. Structure the response:
   - Start with the direct answer
   - Follow with supporting evidence from RAG results
   - End with "Sources" listing the sessions/events referenced

5. If insufficient context is found:
   - Say clearly that the RAG database doesn't have enough context
   - Suggest what the user could search for instead
   - Offer to answer from general knowledge (without RAG)
