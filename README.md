<p align="center">
  <img src="assets/logo.svg" alt="Claude RAG" width="420">
</p>

<h3 align="center">Never lose context. Ever.</h3>

<p align="center">
  The first open source RAG plugin for <a href="https://claude.com/product/claude-code">Claude Code</a>.<br>
  Every conversation, tool call and AI response — indexed and searchable across all your sessions.
</p>

<p align="center">
  <a href="https://clauderag.io">Website</a> &nbsp;|&nbsp;
  <a href="#installation">Install</a> &nbsp;|&nbsp;
  <a href="#features">Features</a> &nbsp;|&nbsp;
  <a href="#commands">Commands</a> &nbsp;|&nbsp;
  <a href="#mcp-tools">MCP Tools</a> &nbsp;|&nbsp;
  <a href="https://github.com/ThisisYoYoDev/claude-rag/issues">Issues</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.3.0-7c3aed" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/MCP_tools-20-blue" alt="MCP Tools">
  <img src="https://img.shields.io/badge/commands-19-orange" alt="Commands">
  <img src="https://img.shields.io/badge/embeddings-Gemini_1536d-red" alt="Embeddings">
</p>

---

<p align="center">
  <img src="assets/demo.svg" alt="Claude RAG Demo" width="800">
</p>

## Why?

**65% of developers** cite context loss as their #1 frustration with AI coding assistants. Claude Code forgets everything between sessions. Context compaction destroys your instructions mid-conversation. The same mistakes happen again and again.

Claude RAG fixes this. It **captures every interaction** in the background, **embeds it with Gemini**, and **injects relevant context** into every new prompt — automatically.

## What makes it different

| | Claude RAG | claude-mem | Cursor Memory |
|---|:---:|:---:|:---:|
| **Embeddings** | Gemini 1536d | MiniLM 384d | Proprietary |
| **Search** | Hybrid (Vector + BM25 + RRF) | ChromaDB | N/A |
| **Vector index** | DiskANN (scales to millions) | ChromaDB | N/A |
| **Multimodal** | Images, PDF, audio, video | Text only | Text only |
| **Cost to user** | Free | 2x API cost (SDK agent) | Included |
| **Architecture** | Cloud (works across devices) | Local only | Local only |
| **Turn linking** | Q + Tools + A grouped | Observations | N/A |
| **Privacy tags** | `<private>` stripping | `<private>` | Content exclusion |
| **License** | MIT | AGPL-3.0 | Proprietary |
| **Post-compaction recovery** | Auto re-inject context | No | No |
| **Tech debt tracking** | Built-in | No | No |
| **Decision journal** | Auto-tagged | No | No |

## Installation

```bash
# 1. Add the marketplace
/plugin marketplace add ThisisYoYoDev/claude-plugins

# 2. Install the plugin
/plugin install claude-rag@yoyodev

# 3. Create your free account
/claude-rag:setup

# 4. Done — start coding normally
```

The setup auto-detects your email from `git config`, sends a magic link, and configures everything. Your conversations are captured automatically from that point on.

> **Already have an account?** Use `/claude-rag:login` to sign in on a new machine.

## How it works

```
 You type a prompt
     │
     ├─ 1. RAG searches past sessions (hybrid: vector + BM25)
     │     → relevant context injected silently into your prompt
     │     → continuation context: "where you left off" from last session
     │
     ├─ 2. Claude responds using your full history as context
     │
     └─ 3. Everything is captured in the background
           → prompt, tools, response grouped by turn
           → embedded with Gemini 1536d
           → stored in PostgreSQL + DiskANN
           → searchable across all sessions forever
```

### What you see at startup

```
Claude RAG v0.3.0 — resumed + 3 contexts from "myproject"
```

### What you see on each prompt

```
❯ how did we fix the auth bug?

⎿ 🔍 RAG found 3 matches (8ms)
    💬 87% — Q: Fix the authentication bug in login
       🔧 2x Read, 1x Bash
       🤖 A: Changed TOKEN_EXPIRY from 3600 to 86400... (247 tokens)
    💬 72% — Q: Do the auth tests pass?
       🤖 A: 14 passed, 0 failed (5 tokens)

● The auth bug was in `src/auth/token.ts`...
```

## Features

### Capture & Memory

- **Auto-capture** — every prompt, AI response, tool call, and sub-agent activity
- **Turn linking** — Q + Tools + A grouped together via transcript promptId
- **Token tracking** — real Anthropic token counts (input, output, cache) per session
- **Session summaries** — auto-generated at session end, cached for fast retrieval
- **Continuation context** — "where you left off" injected at session start
- **Post-compaction recovery** — re-injects critical context when Claude's memory is compressed
- **Multimodal** — images, PDFs, audio, video uploaded to S3 and embedded with Gemini

### Search & Intelligence

- **Hybrid search** — Vector (Gemini 1536d) + BM25 full-text + Reciprocal Rank Fusion
- **Re-ranking** — 5 heuristic signals: recency, turn completeness, content type, term overlap, length
- **Progressive disclosure** — compact results first, expand on demand (saves tokens)
- **Code-aware chunking** — splits by functions/classes for 50+ languages
- **Contextual enrichment** — each chunk prefixed with metadata before embedding
- **DiskANN filtered search** — label-based pre-filtering for fast, precise results
- **Search cache** — LRU with 15min TTL (537ms → 5ms for repeated queries)

### Analytics & Insights

- **Productivity metrics** — sessions, tokens, tools, files touched, activity heatmaps
- **Tech debt tracker** — churn hotspots, TODO/FIXME markers, recurring errors, debt score
- **Mistake memory** — error-to-fix patterns: what went wrong and how it was fixed
- **Decision journal** — auto-detects architectural decisions (12 patterns, FR+EN)
- **Project summaries** — cumulative overview of project activity and key areas
- **Code history** — track how files evolved across all sessions

### Privacy & Security

- **`<private>` tags** — wrap sensitive content, stripped before storage
- **User isolation** — all data scoped per user via API key
- **SHA-256 hashed keys** — API keys never stored in plain text
- **Soft delete** — data hidden from search but recoverable

## Commands

### Core

| Command | Description |
|---------|-------------|
| `/claude-rag:search [query]` | Semantic search with progressive disclosure |
| `/claude-rag:ask [question]` | Ask about past work |
| `/claude-rag:browse` | Browse sessions and projects |
| `/claude-rag:stats` | View database statistics |

### Intelligence

| Command | Description |
|---------|-------------|
| `/claude-rag:recap` | Summary of recent sessions with insights |
| `/claude-rag:plan` | Create implementation plans informed by past sessions |
| `/claude-rag:review` | Review work against historical patterns |
| `/claude-rag:explore` | Explore code history via RAG |
| `/claude-rag:knowledge [topic]` | Search project knowledge base |
| `/claude-rag:decisions` | List architectural decisions |
| `/claude-rag:productivity` | Personal dev metrics (WakaTime for AI) |
| `/claude-rag:debt` | Tech debt analysis with churn score |
| `/claude-rag:onboard` | Generate project onboarding guide |

### Account

| Command | Description |
|---------|-------------|
| `/claude-rag:setup` | First-time setup |
| `/claude-rag:login` | Login on a new machine |
| `/claude-rag:logout` | Logout and revoke API key |
| `/claude-rag:config` | Change settings |
| `/claude-rag:forget` | Soft-delete data |
| `/claude-rag:restore` | Restore deleted data |

## MCP Tools

20 native MCP tools — no curl hacks, no shell commands:

| Tool | Description |
|------|-------------|
| `search` | Hybrid semantic + full-text search with filters |
| `detail` | Fetch full event content by IDs (progressive disclosure layer 2) |
| `turn` | Fetch complete Q+Tools+A turn (layer 3) |
| `timeline` | Browse session turns chronologically with pagination |
| `code_search` | Semantic search scoped to code, filterable by language |
| `code_history` | File interaction history across all sessions |
| `productivity` | Personal dev metrics: sessions, tokens, tools, activity |
| `knowledge` | Project knowledge base search (decisions, explanations, debugging) |
| `onboard` | Auto-generated project onboarding guide |
| `mistakes` | Error-to-fix patterns from past sessions |
| `debt` | Tech debt: churn hotspots, markers, recurring errors |
| `decisions` | Architectural decisions auto-detected in conversations |
| `stats` | Database statistics |
| `browse_sessions` | List/detail sessions |
| `browse_projects` | List projects |
| `forget` | Soft-delete data |
| `restore` | Restore deleted data |
| `health` | Backend status |
| `login` | Account login with magic link |
| `setup` | First-time account creation |

## Architecture

```
Plugin (your machine)               Backend (cloud)
┌─────────────────────-┐            ┌──────────────────────────┐
│  6 Hooks             │            │  Hono API (Bun)          │
│  ├ SessionStart      │───────────▶│  ├ /ingest               │
│  ├ UserPromptSubmit  │  auto RAG  │  ├ /search (hybrid)      │
│  ├ PostToolUse       │◀───────────│  ├ /analytics/*          │
│  ├ PostToolUseFailure│            │  ├ /sessions/*           │
│  ├ Stop              │            │  ├ /events, /turns       │
│  └ SubagentStop      │            │  └ /projects/*           │
│                      │            │                          │
│  20 MCP Tools        │            │  PostgreSQL + pgvector   │
│  19 Commands         │            │  + pgvectorscale DiskANN │
│                      │            │  + tsvector GIN (BM25)   │
└─────────────────────-┘            │                          │
                                    │  Gemini Embedding 2      │
                                    │  (1536d, multimodal)     │
                                    │                          │
                                    │  Hetzner S3              │
                                    │  (images, PDFs, audio)   │
                                    └──────────────────────────┘
```

## Search: How hybrid works

```
Query: "fix auth middleware"
    │
    ├── Vector Search (Gemini 1536d + DiskANN)
    │   → understands MEANING: "repair authentication layer"
    │   → ranked by cosine similarity
    │
    ├── BM25 Full-Text (PostgreSQL tsvector + GIN)
    │   → finds EXACT TERMS: "auth", "middleware"
    │   → ranked by term frequency
    │
    └── Reciprocal Rank Fusion (K=60)
        → merges both ranked lists
        → documents found by BOTH engines score highest
        → +20-30% precision vs vector-only
        │
        └── Re-ranking (5 signals)
            → recency, turn completeness, content type,
              query term overlap, content length
            → +10-25% additional precision
```

## Configuration

Config file: `~/.claude/plugins/claude-rag/config.json`

```json
{
  "connection": {
    "endpoint": "https://api.clauderag.io",
    "apiKey": "cr_sk_..."
  },
  "capture": {
    "enabled": true,
    "userPrompts": true,
    "aiOutputs": true,
    "toolCalls": true,
    "toolResults": true,
    "subAgents": true,
    "multimodal": { "copyFiles": true }
  },
  "rag": {
    "mode": "auto",
    "threshold": 0.6,
    "maxContextTokens": 5000
  }
}
```

### RAG modes

| Mode | Behavior |
|------|----------|
| `off` | Capture only, no context injection |
| `manual` | Only via `/claude-rag:search` |
| `auto` | Inject relevant context on every prompt (recommended) |
| `aggressive` | Auto + Claude can search on its own |

### Context tokens guide

| Context window | Recommended | Results per query |
|---------------|-------------|-------------------|
| **200K** | `5000` (default) | 3-5 full turns |
| **200K** | `8000` | 5-8 full turns |
| **1M** | `5000` (default) | 3-5 full turns |
| **1M** | `15000` | 10-15 full turns |
| **1M** | `30000` | 20+ full turns |

> With a 1M context window, you can safely increase `maxContextTokens` to 15K-30K for richer context. A "turn" is a Q + Tools + A group (~500-1500 tokens each).

## Tech stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Bun |
| **Backend** | Hono (TypeScript) |
| **Database** | PostgreSQL + pgvector + pgvectorscale |
| **Vector index** | DiskANN (StreamingDiskANN) |
| **Full-text** | PostgreSQL tsvector + GIN (BM25) |
| **Embeddings** | Gemini Embedding 2 (1536d, multimodal) |
| **Storage** | Hetzner Object Storage (S3-compatible) |
| **Auth** | Magic link + SHA-256 hashed API keys |
| **Search fusion** | Reciprocal Rank Fusion (RRF) |

## Privacy

- All data scoped per user — complete isolation via API key
- `<private>` tags stripped before data leaves your machine
- API keys SHA-256 hashed with salt in database
- Soft delete everywhere — data recoverable, never hard-deleted
- No telemetry, no analytics on your code

## Roadmap

- [ ] Web dashboard (app.clauderag.io)
- [ ] Self-hosted Docker version

## Links

- **Website**: [clauderag.io](https://clauderag.io)
- **API**: [api.clauderag.io](https://api.clauderag.io/health)
- **Marketplace**: [ThisisYoYoDev/claude-plugins](https://github.com/ThisisYoYoDev/claude-plugins)

## Author

Built by [Yoel Edery](https://www.linkedin.com/in/yoel-edery/)

## License

[MIT](LICENSE)
