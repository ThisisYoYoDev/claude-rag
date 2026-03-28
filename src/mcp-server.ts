#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RagApiClient } from "./api-client";
import { loadConfig } from "./config";

const config = loadConfig();
const client = new RagApiClient({
  endpoint: config.connection.endpoint,
  apiKey: config.connection.apiKey,
  timeoutMs: 10000,
});

const server = new McpServer({
  name: "claude-rag",
  version: "0.1.0",
});

// ==========================================
// Tool: search
// ==========================================

server.registerTool(
  "search",
  {
    title: "RAG Search",
    description:
      "Semantic search across all past conversations, tool results, AI outputs, and sub-agent activity. Returns ranked results with relevance scores.",
    inputSchema: z.object({
      query: z.string().describe("Search query in natural language"),
      limit: z
        .number()
        .min(1)
        .max(50)
        .default(10)
        .describe("Maximum number of results"),
      threshold: z
        .number()
        .min(0)
        .max(1)
        .default(0.5)
        .describe("Minimum relevance score (0-1)"),
      content_types: z
        .array(
          z.enum([
            "user_prompt",
            "ai_output",
            "tool_call",
            "tool_result",
            "error",
          ])
        )
        .optional()
        .describe("Filter by content type"),
      tool_names: z
        .array(z.string())
        .optional()
        .describe("Filter by tool name (Read, Bash, Grep, etc.)"),
      tool_categories: z
        .array(z.enum(["file", "code", "search", "web", "mcp", "system"]))
        .optional()
        .describe("Filter by tool category"),
      is_sub_agent: z
        .boolean()
        .optional()
        .describe("Filter: only sub-agent results"),
      agent_types: z
        .array(z.string())
        .optional()
        .describe("Filter by agent type (main, Explore, Plan, etc.)"),
      project_id: z.string().optional().describe("Filter by project ID"),
      date_from: z
        .string()
        .optional()
        .describe("Filter: results after this date (ISO 8601)"),
      date_to: z
        .string()
        .optional()
        .describe("Filter: results before this date (ISO 8601)"),
    }),
  },
  async (args) => {
    const result = await client.search(args.query, {
      limit: args.limit,
      threshold: args.threshold,
      filters: {
        content_types: args.content_types,
        tool_names: args.tool_names,
        tool_categories: args.tool_categories,
        is_sub_agent: args.is_sub_agent,
        agent_types: args.agent_types,
        project_id: args.project_id,
        date_from: args.date_from,
        date_to: args.date_to,
      },
    });

    if (result.results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No results found for "${args.query}" (threshold: ${args.threshold}). Try lowering the threshold or broadening the query.`,
          },
        ],
      };
    }

    const lines = result.results.map((r: any, i: number) => {
      const icon =
        { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧", error: "❌" }[
          r.content_type
        ] || "📄";
      const sub = r.is_sub_agent ? ` [${r.agent_type}]` : "";
      const tool = r.tool_name ? ` (${r.tool_name})` : "";
      const preview = r.content.slice(0, 300).replace(/\n/g, " ");
      return `${i + 1}. ${icon} **${r.content_type}**${tool}${sub} — score: ${(r.score * 100).toFixed(0)}% — ${r.project_name}\n   ${preview}`;
    });

    const text = `Found ${result.total} results in ${result.latency_ms}ms:\n\n${lines.join("\n\n")}`;

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: stats
// ==========================================

server.registerTool(
  "stats",
  {
    title: "RAG Statistics",
    description:
      "Show RAG database statistics: total events, embeddings, chunks, projects, tools, languages, recent sessions.",
    inputSchema: z.object({}),
  },
  async () => {
    const res = await fetch(`${config.connection.endpoint}/api/v1/stats`, {
      headers: config.connection.apiKey
        ? { Authorization: `Bearer ${config.connection.apiKey}` }
        : {},
    });
    const stats = (await res.json()) as any;

    const text = [
      "## RAG Database Statistics\n",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Events | ${stats.total_events} |`,
      `| Embeddings | ${stats.total_embeddings} |`,
      `| Chunks | ${stats.chunking?.total_chunks || 0} (avg ${stats.chunking?.avg_chunks_per_event || 0}/event) |`,
      `| Sessions | ${stats.total_sessions} |`,
      `| Projects | ${stats.total_projects} |`,
      `| Files | ${stats.total_files} |`,
      `| Pending | ${stats.pending_embeddings} |`,
      "",
      "### By Content Type",
      ...Object.entries(stats.by_content_type || {}).map(
        ([k, v]) => `- ${k}: ${v}`
      ),
      "",
      "### Top Tools",
      ...Object.entries(stats.by_tool || {}).map(
        ([k, v]) => `- ${k}: ${v}`
      ),
      "",
      "### Languages",
      ...Object.entries(stats.by_language || {}).map(
        ([k, v]) => `- ${k}: ${v}`
      ),
      "",
      "### Projects",
      ...(stats.by_project || []).map(
        (p: any) =>
          `- **${p.name}**: ${p.event_count} events, ${p.session_count} sessions`
      ),
      "",
      "### Recent Sessions",
      ...(stats.recent_sessions || []).map(
        (s: any) =>
          `- ${s.display_name || s.session_name || s.id.slice(0, 8)} (${s.project_name}) — ${s.event_count} events — ${s.started_at}`
      ),
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: browse_sessions
// ==========================================

server.registerTool(
  "browse_sessions",
  {
    title: "Browse Sessions",
    description:
      "List past Claude Code sessions with event counts, or get details of a specific session.",
    inputSchema: z.object({
      session_id: z
        .string()
        .optional()
        .describe(
          "Specific session ID to get details. Leave empty to list all sessions."
        ),
      project_id: z
        .string()
        .optional()
        .describe("Filter sessions by project ID"),
      limit: z.number().min(1).max(50).default(10).describe("Max sessions to list"),
    }),
  },
  async (args) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.connection.apiKey)
      headers["Authorization"] = `Bearer ${config.connection.apiKey}`;

    if (args.session_id) {
      // Session detail
      const res = await fetch(
        `${config.connection.endpoint}/api/v1/sessions/${args.session_id}`,
        { headers }
      );
      const session = (await res.json()) as any;

      if (session.error)
        return {
          content: [{ type: "text" as const, text: `Error: ${session.error}` }],
        };

      const eventsRes = await fetch(
        `${config.connection.endpoint}/api/v1/sessions/${args.session_id}/events?limit=30`,
        { headers }
      );
      const eventsData = (await eventsRes.json()) as any;

      const text = [
        `## Session: ${session.session_name || session.id}`,
        `- **Project**: ${session.project_name}`,
        `- **Model**: ${session.model || "unknown"}`,
        `- **Started**: ${session.started_at}`,
        "",
        "### Event Breakdown",
        ...Object.entries(session.event_stats || {}).map(
          ([k, v]) => `- ${k}: ${v}`
        ),
        "",
        "### Tool Usage",
        ...Object.entries(session.tool_stats || {}).map(
          ([k, v]) => `- ${k}: ${v}`
        ),
        "",
        "### Agents",
        ...(session.agents || []).map(
          (a: any) => `- ${a.agent_type} (depth: ${a.depth})`
        ),
        "",
        "### Recent Events",
        ...(eventsData.events || []).slice(0, 20).map((e: any, i: number) => {
          const icon =
            { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧", error: "❌" }[
              e.content_type
            ] || "📄";
          const tool = e.tool_name ? ` [${e.tool_name}]` : "";
          const sub = e.is_sub_agent ? " (sub-agent)" : "";
          return `${i + 1}. ${icon}${tool}${sub} ${e.content.slice(0, 100).replace(/\n/g, " ")}`;
        }),
      ].join("\n");

      return { content: [{ type: "text" as const, text }] };
    }

    // List sessions
    const params = new URLSearchParams({ limit: String(args.limit) });
    if (args.project_id) params.set("project_id", args.project_id);

    const res = await fetch(
      `${config.connection.endpoint}/api/v1/sessions?${params}`,
      { headers }
    );
    const data = (await res.json()) as any;

    if (!data.sessions?.length) {
      return {
        content: [
          { type: "text" as const, text: "No sessions found. Start using Claude Code to capture conversations." },
        ],
      };
    }

    const text = [
      "## Recent Sessions\n",
      "| # | Session | Project | Events | ID |",
      "|---|---------|---------|--------|----|",
      ...data.sessions.map(
        (s: any, i: number) =>
          `| ${i + 1} | ${s.display_name || s.session_name || s.id.slice(0, 8)} | ${s.project_name} | ${s.event_count} | \`${s.id}\` |`
      ),
      "",
      "Use `browse_sessions` with a session_id to see details.",
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: browse_projects
// ==========================================

server.registerTool(
  "browse_projects",
  {
    title: "Browse Projects",
    description: "List all projects with their session and event counts.",
    inputSchema: z.object({}),
  },
  async () => {
    const headers: Record<string, string> = {};
    if (config.connection.apiKey)
      headers["Authorization"] = `Bearer ${config.connection.apiKey}`;

    const res = await fetch(
      `${config.connection.endpoint}/api/v1/projects`,
      { headers }
    );
    const data = (await res.json()) as any;

    if (!data.projects?.length) {
      return {
        content: [
          { type: "text" as const, text: "No projects found." },
        ],
      };
    }

    const text = [
      "## Projects\n",
      "| Project | Sessions | Events | ID |",
      "|---------|----------|--------|----|",
      ...data.projects.map(
        (p: any) =>
          `| **${p.name}** | ${p.session_count} | ${p.event_count} | \`${p.id}\` |`
      ),
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: forget
// ==========================================

server.registerTool(
  "forget",
  {
    title: "Forget (Soft Delete)",
    description:
      "Soft-delete data from the RAG database. Data can be restored later. Scope: session, project, or all.",
    inputSchema: z.object({
      scope: z
        .enum(["session", "project", "all"])
        .describe("What to delete: a session, a project, or all data"),
      id: z
        .string()
        .optional()
        .describe("The session UUID or project UUID. Required for session/project scope, ignored for all."),
    }),
  },
  async (args) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.connection.apiKey)
      headers["Authorization"] = `Bearer ${config.connection.apiKey}`;

    // Handle "all" scope — delete all projects
    if (args.scope === "all") {
      const projRes = await fetch(`${config.connection.endpoint}/api/v1/projects`, { headers });
      const projData = (await projRes.json()) as any;
      const projects = projData.projects || [];

      let deleted = 0;
      for (const p of projects) {
        const r = await fetch(`${config.connection.endpoint}/api/v1/projects/${p.id}`, { method: "DELETE", headers });
        const d = (await r.json()) as any;
        if (!d.error) deleted++;
      }

      return {
        content: [{
          type: "text" as const,
          text: `Soft-deleted ${deleted} project(s) and all their data. Use \`restore\` with a project ID to undo.`,
        }],
      };
    }

    if (!args.id) {
      return {
        content: [{ type: "text" as const, text: "Error: id is required for session/project scope. Use browse_sessions or browse_projects to find the UUID." }],
      };
    }

    const endpoint =
      args.scope === "session"
        ? `${config.connection.endpoint}/api/v1/sessions/${args.id}`
        : `${config.connection.endpoint}/api/v1/projects/${args.id}`;

    const res = await fetch(endpoint, { method: "DELETE", headers });
    const data = (await res.json()) as any;

    if (data.error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${data.error}` }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: `Soft-deleted ${args.scope} \`${args.id}\`. Use \`restore\` to undo.`,
      }],
    };
  }
);

// ==========================================
// Tool: restore
// ==========================================

server.registerTool(
  "restore",
  {
    title: "Restore Soft-Deleted Data",
    description:
      "Restore previously soft-deleted data (undo a forget operation). Currently supports project-level restore.",
    inputSchema: z.object({
      project_id: z
        .string()
        .describe("The project ID to restore"),
    }),
  },
  async (args) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.connection.apiKey)
      headers["Authorization"] = `Bearer ${config.connection.apiKey}`;

    const res = await fetch(
      `${config.connection.endpoint}/api/v1/projects/${args.project_id}/restore`,
      { method: "POST", headers }
    );
    const data = (await res.json()) as any;

    if (data.error) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${data.error}` },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Restored project \`${args.project_id}\`. All sessions, events, and embeddings are back.`,
        },
      ],
    };
  }
);

// ==========================================
// Tool: health
// ==========================================

server.registerTool(
  "health",
  {
    title: "RAG Health Check",
    description: "Check if the RAG backend is running and the database is connected.",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const data = await client.health();
      return {
        content: [
          {
            type: "text" as const,
            text: `RAG Backend: ${data.status === "ok" ? "✅ Online" : "❌ Error"}\nDatabase: ${data.db ? "✅ Connected" : "❌ Disconnected"}\nEndpoint: ${config.connection.endpoint}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `❌ RAG Backend unreachable at ${config.connection.endpoint}\nError: ${err instanceof Error ? err.message : "Unknown"}\n\nMake sure the backend is running.`,
          },
        ],
      };
    }
  }
);

// ==========================================
// Tool: login (with native elicitation)
// ==========================================

server.registerTool(
  "login",
  {
    title: "Login to Claude RAG",
    description:
      "Login to your Claude RAG account. Sends a magic link to your email and verifies with a 6-digit code.",
    inputSchema: z.object({
      email: z.string().email().optional().describe("Email address. If not provided, will be auto-detected from git config."),
    }),
  },
  async (args, ctx) => {
    const endpoint = config.connection.endpoint;
    let email = args.email;

    // Auto-detect email if not provided
    if (!email) {
      try {
        const proc = Bun.spawnSync(["git", "config", "--global", "user.email"]);
        email = proc.stdout.toString().trim();
      } catch {}
    }

    // If still no email, use elicitation to ask
    if (!email) {
      try {
        const result = await server.server.elicitInput({
          message: "Enter your email to login to Claude RAG:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              email: { type: "string" as const, description: "Your email address" },
            },
          },
        });
        if (result.action === "accept" && result.content) {
          email = (result.content as any).email;
        }
      } catch {
        return { content: [{ type: "text" as const, text: "Could not get email. Please provide it as argument: `login(email: 'you@example.com')`" }] };
      }
    }

    if (!email) {
      return { content: [{ type: "text" as const, text: "No email provided." }] };
    }

    // Send magic link
    const res = await fetch(`${endpoint}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as any;

    if (data.error) {
      return { content: [{ type: "text" as const, text: `Error: ${data.error}` }] };
    }

    // Ask for code via elicitation
    try {
      const codeResult = await server.server.elicitInput({
        message: `A verification email has been sent to ${email}.\nClick the magic link or enter the 6-digit code:`,
        requestedSchema: {
          type: "object" as const,
          properties: {
            code: { type: "string" as const, description: "6-digit verification code from email" },
          },
        },
      });

      if (codeResult.action === "accept" && codeResult.content) {
        const code = (codeResult.content as any).code;

        // Verify code
        const verifyRes = await fetch(`${endpoint}/api/v1/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });
        const verifyData = (verifyRes as any).json ? await (verifyRes as Response).json() as any : null;

        if (verifyData?.status === "verified") {
          // Save config
          const configPath = `${process.env.HOME}/.claude/plugins/claude-rag/config.json`;
          const { mkdirSync, writeFileSync, readFileSync } = await import("node:fs");
          const { dirname } = await import("node:path");
          mkdirSync(dirname(configPath), { recursive: true });

          let existing: any = {};
          try { existing = JSON.parse(readFileSync(configPath, "utf-8")); } catch {}
          existing.connection = { endpoint, apiKey: verifyData.api_key };
          writeFileSync(configPath, JSON.stringify(existing, null, 2));

          return {
            content: [{
              type: "text" as const,
              text: `✅ Logged in!\n\nAccount: ${email}\nAPI key saved to config.\n\nRestart Claude Code for changes to take effect.`,
            }],
          };
        } else {
          return { content: [{ type: "text" as const, text: `❌ Invalid or expired code. ${verifyData?.error || ""}` }] };
        }
      }
    } catch {
      // Elicitation not supported — fallback message
      return {
        content: [{
          type: "text" as const,
          text: `📧 Magic link sent to ${email}!\n\nClick the link in your email, then use the /claude-rag:login command again with your code.`,
        }],
      };
    }

    return { content: [{ type: "text" as const, text: "Login cancelled." }] };
  }
);

// ==========================================
// Tool: setup (with native elicitation)
// ==========================================

server.registerTool(
  "setup",
  {
    title: "Setup Claude RAG",
    description:
      "First-time setup for Claude RAG. Creates your free account with email verification.",
    inputSchema: z.object({
      email: z.string().email().optional().describe("Email for your account. Auto-detected from git if not provided."),
    }),
  },
  async (args, ctx) => {
    const endpoint = config.connection.endpoint;
    let email = args.email;

    // Auto-detect
    if (!email) {
      try {
        const proc = Bun.spawnSync(["git", "config", "--global", "user.email"]);
        email = proc.stdout.toString().trim();
      } catch {}
    }

    // Ask via elicitation if needed
    if (!email) {
      try {
        const result = await server.server.elicitInput({
          message: "Create your free Claude RAG account.\nEnter your email:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              email: { type: "string" as const, description: "Your email address" },
            },
          },
        });
        if (result.action === "accept" && result.content) {
          email = (result.content as any).email;
        }
      } catch {
        return { content: [{ type: "text" as const, text: "Could not get email. Please provide it: `setup(email: 'you@example.com')`" }] };
      }
    }

    if (!email) {
      return { content: [{ type: "text" as const, text: "No email provided." }] };
    }

    // Register
    const res = await fetch(`${endpoint}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as any;

    if (data.error) {
      return { content: [{ type: "text" as const, text: `Error: ${data.error}` }] };
    }

    // Ask for code
    try {
      const codeResult = await server.server.elicitInput({
        message: `📧 Verification email sent to ${email}.\nClick the magic link or enter the 6-digit code:`,
        requestedSchema: {
          type: "object" as const,
          properties: {
            code: { type: "string" as const, description: "6-digit code from email" },
          },
        },
      });

      if (codeResult.action === "accept" && codeResult.content) {
        const code = (codeResult.content as any).code;

        const verifyRes = await fetch(`${endpoint}/api/v1/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });
        const verifyData = await (verifyRes as Response).json() as any;

        if (verifyData?.status === "verified") {
          // Write full config
          const configPath = `${process.env.HOME}/.claude/plugins/claude-rag/config.json`;
          const { mkdirSync, writeFileSync } = await import("node:fs");
          const { dirname } = await import("node:path");
          mkdirSync(dirname(configPath), { recursive: true });

          const fullConfig = {
            connection: { endpoint, apiKey: verifyData.api_key },
            capture: {
              enabled: true, userPrompts: true, aiOutputs: true,
              toolCalls: true, toolResults: true, subAgents: true,
              multimodal: { copyFiles: true, maxFileSize: "50MB" },
              exclude: { tools: ["AskUserQuestion"], pathPatterns: [] },
            },
            rag: {
              mode: "auto", threshold: 0.6, maxContextTokens: 5000,
              perPrompt: { enabled: true, maxItems: 5, maxLatencyMs: 500 },
              sessionStart: { enabled: true, maxItems: 3 },
            },
            privacy: { redactSecrets: false, excludePatterns: [] },
          };
          writeFileSync(configPath, JSON.stringify(fullConfig, null, 2));

          return {
            content: [{
              type: "text" as const,
              text: `✅ Setup complete!\n\nAccount: ${email} (free plan)\nConfig saved.\n\nYour conversations are now being captured automatically.\n\nCommands:\n  /claude-rag:search [query]  — Search past conversations\n  /claude-rag:ask [question]  — Ask about past work\n  /claude-rag:browse          — Browse sessions\n  /claude-rag:stats           — View statistics\n\nRestart Claude Code for all changes to take effect.`,
            }],
          };
        } else {
          return { content: [{ type: "text" as const, text: `❌ Invalid or expired code. ${verifyData?.error || ""}` }] };
        }
      }
    } catch {
      return {
        content: [{
          type: "text" as const,
          text: `📧 Verification email sent to ${email}!\n\nClick the magic link in your email, or use:\n  /claude-rag:setup to try again with the code.`,
        }],
      };
    }

    return { content: [{ type: "text" as const, text: "Setup cancelled." }] };
  }
);

// ==========================================
// Start server
// ==========================================

const transport = new StdioServerTransport();
await server.connect(transport);
