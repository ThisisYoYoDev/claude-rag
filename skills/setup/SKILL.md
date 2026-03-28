---
name: setup
description: First-time setup for the Claude RAG plugin — configure backend connection, test everything, show quick reference
disable-model-invocation: true
allowed-tools: Bash(*), Read, Write, AskUserQuestion
---

# RAG Plugin Setup

Guide the user through first-time setup of the Claude RAG plugin.

## Steps

### Step 1: Check current config

```bash
cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo "NO_CONFIG"
```

If config exists, show current settings and ask if they want to reconfigure.

### Step 2: Choose connection mode

Use AskUserQuestion:
- header: "Claude RAG Setup"
- question: "How do you want to connect to the RAG backend?"
- options:
  - "Local (Docker — for development only)"
  - "Cloud (remote server)"

### Step 3: Configure endpoint

**If Local:**
- Check if Docker is running and the backend is accessible:
  ```bash
  curl -s --max-time 3 https://api.clauderag.io/health
  ```
- If not accessible, tell the user:
  ```
  Start the backend with:
  cd <project-root> && docker compose -f docker/docker-compose.yml up -d
  Then: bun run backend/src/index.ts
  ```

**If Cloud:**
- Use AskUserQuestion to get:
  - Endpoint URL
  - API key

### Step 4: Write config

Create the config directory and file:

```bash
mkdir -p ~/.claude/plugins/claude-rag
```

Write `~/.claude/plugins/claude-rag/config.json` with the chosen settings merged with defaults:

```json
{
  "connection": {
    "endpoint": "<chosen_endpoint>",
    "apiKey": "<if_cloud>"
  },
  "capture": {
    "enabled": true,
    "userPrompts": true,
    "aiOutputs": true,
    "toolCalls": true,
    "toolResults": true,
    "subAgents": true,
    "multimodal": { "copyFiles": true, "maxFileSize": "50MB" },
    "exclude": { "tools": ["AskUserQuestion"], "pathPatterns": ["*.env", "*.secret", "*credentials*"] }
  },
  "rag": {
    "mode": "auto",
    "threshold": 0.6,
    "maxContextTokens": 5000,
    "perPrompt": { "enabled": true, "maxItems": 5, "maxLatencyMs": 500 },
    "sessionStart": { "enabled": true, "maxItems": 3 }
  },
  "privacy": {
    "redactSecrets": true,
    "excludePatterns": ["password", "token", "secret", "api_key", "private_key"]
  }
}
```

### Step 5: Test the connection

```bash
curl -s <endpoint>/health
```

Verify the response shows `"status": "ok"` and `"db": true`.

### Step 6: Run a test cycle

Ingest a test event:
```bash
curl -s -X POST <endpoint>/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"events":[{"session_id":"setup-test","agent_id":"main","content_type":"user_prompt","content":"RAG plugin setup test","agent_type":"main","is_sub_agent":false,"hook_event_name":"UserPromptSubmit","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}],"project":"setup-test"}'
```

Wait 3 seconds for embedding, then search:
```bash
sleep 3 && curl -s -X POST <endpoint>/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query":"RAG plugin setup test","limit":1}'
```

Verify a result comes back with score > 0.8.

### Step 7: Show success

Display:
```
Setup complete! The RAG plugin is now active.

Your conversations are being captured automatically.
Context from past sessions will be injected into your prompts.

Quick reference:
  /claude-rag:search [query]  — Search past conversations
  /claude-rag:ask [question]  — Ask about past work
  /claude-rag:browse          — Browse sessions & projects
  /claude-rag:stats           — View statistics
  /claude-rag:config          — Change settings
  /claude-rag:forget          — Soft-delete data
```
