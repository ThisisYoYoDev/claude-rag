---
name: search
description: Semantic search across all past conversations, tool results, AI outputs, and sub-agent activity stored in the RAG database
disable-model-invocation: true
allowed-tools: Bash(curl *)
argument-hint: "[query]"
---

# RAG Search

Search the RAG database for content matching the user's query: "$ARGUMENTS"

## Instructions

1. Read the plugin config to get the backend endpoint:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. Execute the search query against the backend:
   ```bash
   curl -s -X POST <endpoint>/api/v1/search \
     -H "Content-Type: application/json" \
     -d '{"query": "<user_query>", "limit": 10, "threshold": 0.5}'
   ```

3. Display results in a clear, organized format:
   - Group by relevance score (high to low)
   - For each result show:
     - Content type icon: Prompt=💬, AI Response=🤖, Tool Result=🔧, Error=❌
     - Score (as percentage)
     - Tool name (if applicable)
     - Agent type + sub-agent indicator
     - Project name
     - Date
     - Content preview (first 200 chars)
   - If no results: suggest broadening the query or checking filters

4. If the user provides filters in their query, parse them:
   - "in project X" → `{"filters": {"project_id": "X"}}`
   - "from sub-agents" → `{"filters": {"is_sub_agent": true}}`
   - "only tools" → `{"filters": {"content_types": ["tool_call", "tool_result"]}}`
   - "bash results" → `{"filters": {"tool_names": ["Bash"]}}`
   - "code files" → `{"filters": {"tool_categories": ["file"]}}`

5. Show total results count and search latency at the bottom.
