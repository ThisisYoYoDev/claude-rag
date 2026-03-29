---
description: Semantic search across all past conversations, tool results, AI outputs, and sub-agent activity stored in the RAG database
allowed-tools: mcp__plugin_claude-rag_rag__search, mcp__plugin_claude-rag_rag__detail, mcp__plugin_claude-rag_rag__turn
---

# RAG Search

Search the RAG database for: "$ARGUMENTS"

## Workflow (progressive disclosure — saves tokens)

1. **Search** (compact): Use `search` to get ranked results with previews and IDs (~30 tokens/result)
2. **Detail** (expand): Use `detail` with event IDs to get full content of interesting results (~500 tokens/event)
3. **Turn** (full context): Use `turn` with turn IDs to see the complete Q+Tools+A exchange

## Search filters

Parse natural language filters from the query:
- "in project X" → project_id filter
- "from sub-agents" → is_sub_agent: true
- "only tools" → content_types: ["tool_call", "tool_result"]
- "bash results" → tool_names: ["Bash"]
- "code files" → tool_categories: ["file"]
- "last week" → date_from with appropriate date

Start with `search`, then expand the most relevant results with `detail` or `turn`.
