---
name: config
description: Configure the Claude RAG plugin — connection, capture settings, RAG mode, privacy, and more
disable-model-invocation: true
allowed-tools: Bash(*), Read, Edit, Write, AskUserQuestion
argument-hint: "[section]"
---

# RAG Configuration

Configure the Claude RAG plugin settings.

## Instructions

1. Read current config:
   ```bash
   cat ~/.claude/plugins/claude-rag/config.json 2>/dev/null || echo '{"connection":{"endpoint":"https://api.clauderag.io"}}'
   ```

2. If "$ARGUMENTS" matches a section name, go directly to that section.
   Otherwise, show the main menu.

## Main Menu

Use AskUserQuestion:
- header: "Claude RAG Configuration"
- question: "What would you like to configure?"
- options:
  - "Connection — endpoint & API key"
  - "Capture — what to record (prompts, tools, agents...)"
  - "RAG Mode — auto injection behavior"
  - "Privacy — secret redaction & exclusions"
  - "Show current config"
  - "Reset to defaults"
  - "Test connection"

## Section: Connection

Use AskUserQuestion:
- question: "Connection type?"
- options: ["Local (Docker — for development only)", "Cloud (custom endpoint)"]

If Cloud: ask for endpoint URL and API key.
Write updated config.

## Section: Capture

Use AskUserQuestion with multiSelect:
- question: "What should be captured?"
- multiSelect: true
- options:
  - "User prompts"
  - "AI outputs"
  - "Tool calls (input)"
  - "Tool results (output)"
  - "Sub-agent activity"
  - "Multimodal files"

Then ask for excluded tools (comma-separated, default: "AskUserQuestion").

## Section: RAG Mode

Use AskUserQuestion:
- question: "RAG injection mode?"
- options:
  - "Off — capture only, no injection"
  - "Manual — only /claude-rag:search and /claude-rag:ask"
  - "Auto — inject context on every prompt (recommended)"
  - "Aggressive — auto + Claude can search on its own"

If auto or aggressive, ask for:
- Threshold (0.4-0.9, default 0.6)
- Max context tokens (500-4000, default 2000)

## Section: Privacy

Use AskUserQuestion with multiSelect:
- question: "Privacy settings?"
- multiSelect: true
- options:
  - "Redact secrets (passwords, tokens, API keys)"
  - "Exclude .env files"
  - "Exclude credentials files"

Ask for additional exclusion patterns if needed.

## Section: Show config

Read and display the current config.json formatted nicely.

## Section: Reset

Confirm with AskUserQuestion, then write the default config.

## Section: Test connection

```bash
curl -s <endpoint>/health
```
Show result and status.

## Writing Config

Always read the existing config first, merge changes, then write back.
Config path: `~/.claude/plugins/claude-rag/config.json`

```bash
mkdir -p ~/.claude/plugins/claude-rag
```

Write the full merged JSON config.
