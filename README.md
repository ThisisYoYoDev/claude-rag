<p align="center">
  <img src="assets/logo.svg" alt="Claude RAG" width="420">
</p>

<p align="center">
  <strong>Never lose context. Ever.</strong><br>
  The first open source RAG plugin for <a href="https://claude.com/product/claude-code">Claude Code</a>.
</p>

<p align="center">
  <a href="https://clauderag.io">Website</a> · <a href="#quick-start">Install</a> · <a href="#features">Features</a> · <a href="https://github.com/ThisisYoYoDev/claude-rag/issues">Issues</a>
</p>

---

Every conversation, tool call and AI response — indexed and searchable across all your sessions.

<p align="center">
  <img src="assets/demo.svg" alt="Claude RAG Demo" width="800">
</p>

## What it does

- **Captures everything** — prompts, AI responses, tool calls (Read, Bash, Grep...), sub-agents
- **Embeds with Gemini** — 1536d vectors with code-aware chunking (splits by functions, not arbitrary lines)
- **Searches instantly** — DiskANN vector search, context injected silently into every prompt
- **Links turns** — Q + Tools + A grouped together via transcript promptId

## Installation

### Step 1 — Add the marketplace

```bash
/plugin marketplace add ThisisYoYoDev/claude-plugins
```

### Step 2 — Install the plugin

```bash
/plugin install claude-rag@yoyodev
```

### Step 3 — Create your account

```bash
/claude-rag:setup
```

This will:
- Detect your email from `git config`
- Send a verification magic link
- Save your API key
- Auto-approve all MCP tools

### Step 4 — You're done

Start using Claude Code normally. Your conversations are now captured automatically, and relevant context from past sessions is injected into every prompt.

> **Already have an account?** Use `/claude-rag:login` to sign in on a new machine.

## How it works

```
You type a prompt
    │
    ├── 1. RAG searches past sessions for relevant context
    │      → injected automatically into your prompt
    │
    └── 2. Your prompt + tools + response are captured
           → embedded with Gemini → stored in PostgreSQL + DiskANN
           → available for future searches
```

## What you see

```
❯ how did we fix the auth bug?

└ UserPromptSubmit says: 🔍 RAG found 3 matches (8ms)
    💬 87% — Q: Fix the authentication bug in login
       🔧 2x Read, 1x Bash
       🤖 A: Changed TOKEN_EXPIRY from 3600 to 86400... (247 tokens)
    💬 72% — Q: Do the auth tests pass?
       🤖 A: 14 passed, 0 failed (5 tokens)

● The auth bug was in `src/auth/token.ts`...
```

## Commands

| Command | Description |
|---------|-------------|
| `/claude-rag:setup` | First-time setup — create your free account |
| `/claude-rag:login` | Login to existing account |
| `/claude-rag:logout` | Logout and revoke API key |
| `/claude-rag:search [query]` | Search past conversations |
| `/claude-rag:ask [question]` | Ask about past work |
| `/claude-rag:browse` | Browse sessions & projects |
| `/claude-rag:stats` | View statistics |
| `/claude-rag:config` | Change settings |
| `/claude-rag:forget` | Soft-delete data |
| `/claude-rag:restore` | Restore deleted data |

## MCP Tools

The plugin exposes native MCP tools (no curl hacks):

- `search` — semantic search with filters
- `stats` — database statistics
- `browse_sessions` — list/detail sessions
- `browse_projects` — list projects
- `forget` — soft delete
- `restore` — undo delete
- `health` — backend status
- `login` / `setup` — account management

## Features

- **Automatic RAG** — context injected on every prompt, zero friction
- **Code-aware chunking** — TypeScript, Python, Rust, Go, and 50+ languages
- **Turn linking** — prompt + tools + response grouped by transcript promptId
- **Token tracking** — real Anthropic token counts from the transcript
- **Multi-project** — search across all projects
- **Soft delete** — never lose data
- **Magic link auth** — email verification
- **DiskANN index** — PostgreSQL + pgvectorscale, 28x faster than Pinecone

## Tech stack

- **Backend**: Hono + Bun (TypeScript)
- **Database**: PostgreSQL + pgvector + pgvectorscale (DiskANN)
- **Embeddings**: Gemini Embedding 2 (1536d)

## Configuration

Config file: `~/.claude/plugins/claude-rag/config.json`

```json
{
  "connection": { "endpoint": "https://api.clauderag.io", "apiKey": "cr_sk_..." },
  "capture": { "enabled": true, "userPrompts": true, "aiOutputs": true, "toolCalls": true, "toolResults": true, "subAgents": true },
  "rag": { "mode": "auto", "threshold": 0.6, "maxContextTokens": 2000 }
}
```

RAG modes:
- `off` — capture only, no injection
- `manual` — only via /claude-rag:search
- `auto` — inject on every prompt (recommended)
- `aggressive` — auto + Claude can search on its own

## Privacy

- All data is scoped per user (API key → user_id)
- Users cannot see each other's data
- Soft delete preserves data but hides from search
- API keys are SHA-256 hashed in the database

## Links

- **Website**: [clauderag.io](https://clauderag.io)
- **API**: [api.clauderag.io](https://api.clauderag.io/health)

## Author

Built by [Yoel Edery](https://www.linkedin.com/in/yoel-edery/)

## License

MIT
