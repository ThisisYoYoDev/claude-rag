---
description: Semantic search across all past conversations, tool results, AI outputs, and sub-agent activity stored in the RAG database
allowed-tools: mcp__plugin_claude-rag_rag__search
---

# RAG Search

Search the RAG database for: "$ARGUMENTS"

Use the `mcp__plugin_claude-rag_rag__search` tool with the user's query.

Parse natural language filters from the query:
- "in project X" → project_id filter
- "from sub-agents" → is_sub_agent: true
- "only tools" → content_types: ["tool_call", "tool_result"]
- "bash results" → tool_names: ["Bash"]
- "code files" → tool_categories: ["file"]
- "last week" → date_from with appropriate date

Display results clearly with content previews.
