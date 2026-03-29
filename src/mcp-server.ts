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

import pkg from "../package.json";

const server = new McpServer({
  name: "claude-rag",
  version: pkg.version,
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

    // Compact mode: ~30 tokens/result with event_id for progressive disclosure
    const lines = result.results.map((r: any, i: number) => {
      const icon =
        { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧", error: "❌" }[
          r.content_type
        ] || "📄";
      const score = (r.score * 100).toFixed(0);
      const tool = r.tool_name ? ` ${r.tool_name}` : "";
      const sub = r.is_sub_agent ? ` [sub]` : "";
      const turnTag = r.turn_id ? ` turn:${r.turn_id.slice(0, 8)}` : "";
      const preview = r.content.replace(/\n/g, " ").slice(0, 80).trim();
      return `${i + 1}. ${icon} ${score}%${tool}${sub} | ${r.project_name} | ${preview}… [id:${r.event_id}${turnTag}]`;
    });

    const text = [
      `Found ${result.total} results in ${result.latency_ms}ms:`,
      "",
      ...lines,
      "",
      "Use `detail` with event IDs or `turn` with turn IDs to get full content.",
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: detail (Layer 2 — full event content)
// ==========================================

server.registerTool(
  "detail",
  {
    title: "Event Detail",
    description:
      "Fetch full content of specific events by their IDs. Use after `search` to expand results you're interested in. Max 20 IDs per call.",
    inputSchema: z.object({
      event_ids: z
        .array(z.string())
        .min(1)
        .max(20)
        .describe("Event IDs from search results (the [id:xxx] values)"),
    }),
  },
  async (args) => {
    const result = await client.getEvents(args.event_ids);

    if (!result.events?.length) {
      return { content: [{ type: "text" as const, text: "No events found for the given IDs." }] };
    }

    const lines = result.events.map((e: any) => {
      const icon =
        { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧", error: "❌" }[
          e.content_type
        ] || "📄";
      const tool = e.tool_name ? ` [${e.tool_name}]` : "";
      const lang = e.language ? ` (${e.language})` : "";
      const tokens = e.token_count ? ` — ${e.token_count} tokens` : "";
      return `### ${icon} ${e.content_type}${tool}${lang}${tokens}\n**Project:** ${e.project_name} | **Turn:** ${e.turn_id || "n/a"} | **Date:** ${e.created_at}\n\n${e.content}`;
    });

    return { content: [{ type: "text" as const, text: lines.join("\n\n---\n\n") }] };
  }
);

// ==========================================
// Tool: turn (Layer 3 — full Q+Tools+A turn)
// ==========================================

server.registerTool(
  "turn",
  {
    title: "Full Turn",
    description:
      "Fetch a complete conversation turn (Question + Tool calls + Answer) by turn_id. Use after `search` to see the full Q&A exchange.",
    inputSchema: z.object({
      turn_id: z
        .string()
        .describe("Turn ID from search results (the turn:xxx value)"),
    }),
  },
  async (args) => {
    const result = await client.getTurn(args.turn_id);

    if (!result.turn) {
      return { content: [{ type: "text" as const, text: "Turn not found." }] };
    }

    const { turn } = result;
    const lines: string[] = [];

    lines.push(`## Turn — ${turn.project_name}`);
    if (turn.summary.question) {
      lines.push(`\n**Question:** ${turn.summary.question}`);
    }
    if (turn.summary.tools_used?.length) {
      lines.push(`**Tools:** ${turn.summary.tools_used.join(", ")}`);
    }
    if (turn.summary.total_tokens) {
      lines.push(`**Tokens:** ${turn.summary.total_tokens}`);
    }

    lines.push("\n---\n");

    for (const e of turn.events) {
      const icon =
        { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧", error: "❌" }[
          e.content_type
        ] || "📄";
      const tool = e.tool_name ? ` [${e.tool_name}]` : "";
      lines.push(`### ${icon} ${e.content_type}${tool}\n${e.content}\n`);
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ==========================================
// Tool: timeline (session replay)
// ==========================================

server.registerTool(
  "timeline",
  {
    title: "Session Timeline",
    description:
      "Browse turns in a session chronologically. Shows Q&A summaries with tool usage. Use with browse_sessions to find session IDs first.",
    inputSchema: z.object({
      session_id: z.string().describe("Session ID to browse"),
      limit: z.number().min(1).max(50).default(15).describe("Number of turns to show"),
      cursor: z.string().optional().describe("Pagination cursor (ISO date) from previous response"),
      direction: z.enum(["asc", "desc"]).default("desc").describe("Sort order: newest first (desc) or oldest first (asc)"),
    }),
  },
  async (args) => {
    const result = await client.getTimeline(args.session_id, {
      limit: args.limit,
      cursor: args.cursor,
      direction: args.direction,
    });

    if (!result.session) {
      return { content: [{ type: "text" as const, text: "Session not found." }] };
    }

    const lines: string[] = [];
    lines.push(`## Timeline: ${result.session.display_name || result.session.id.slice(0, 8)}`);
    lines.push(`**Project:** ${result.session.project_name} | **Started:** ${result.session.created_at}\n`);

    for (const t of result.turns) {
      if (t.turn_id) {
        const tools = t.tools?.length ? ` | Tools: ${t.tools.join(", ")} (${t.tool_count})` : "";
        const tokens = t.tokens?.output ? ` | ${t.tokens.output} tokens` : "";
        const q = t.question ? t.question.slice(0, 80) : "...";
        const a = t.answer_preview ? t.answer_preview.slice(0, 80) : "...";
        lines.push(`- 💬 **Q:** ${q}`);
        lines.push(`  🤖 **A:** ${a}${tools}${tokens}`);
        lines.push(`  _${t.event_count} events | turn:${t.turn_id.slice(0, 8)} | ${t.timestamp}_`);
      } else {
        const icon =
          { user_prompt: "💬", ai_output: "🤖", tool_call: "📤", tool_result: "🔧" }[
            t.content_type || ""
          ] || "📄";
        lines.push(`- ${icon} ${t.content_type}${t.tool_name ? ` [${t.tool_name}]` : ""}: ${(t.preview || "").slice(0, 80)}`);
        lines.push(`  _${t.timestamp} | id:${t.event_id}_`);
      }
      lines.push("");
    }

    if (result.has_more) {
      lines.push(`_More results available. Use cursor: "${result.next_cursor}"_`);
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ==========================================
// Tool: code_search (semantic code search)
// ==========================================

server.registerTool(
  "code_search",
  {
    title: "Code Search",
    description:
      "Semantic search specifically in code: tool results, edits, reads. Filter by programming language or file path pattern. Better than grep — finds semantically similar code across all sessions.",
    inputSchema: z.object({
      query: z.string().describe("What to search for in code (natural language or code snippet)"),
      language: z
        .string()
        .optional()
        .describe("Filter by language: typescript, python, rust, go, etc."),
      file_pattern: z
        .string()
        .optional()
        .describe("Filter by file path pattern (e.g. 'auth', 'middleware', 'test')"),
      limit: z.number().min(1).max(30).default(10).describe("Max results"),
      threshold: z.number().min(0).max(1).default(0.5).describe("Min relevance score"),
    }),
  },
  async (args) => {
    // Build filters for code-only search
    const filters: any = {
      content_types: ["tool_call", "tool_result"],
      tool_names: ["Read", "Edit", "Write", "Grep", "Glob", "Bash"],
    };
    if (args.language) {
      filters.languages = [args.language];
    }

    // Append file pattern to query for better semantic matching
    const query = args.file_pattern
      ? `${args.query} file:${args.file_pattern}`
      : args.query;

    const result = await client.search(query, {
      limit: args.limit,
      threshold: args.threshold,
      filters,
    });

    if (result.results.length === 0) {
      return { content: [{ type: "text" as const, text: `No code found for "${args.query}". Try a broader query or lower threshold.` }] };
    }

    const lines = result.results.map((r: any, i: number) => {
      const tool = r.tool_name || "code";
      const lang = r.language ? ` (${r.language})` : "";
      const score = (r.score * 100).toFixed(0);
      const preview = r.content.replace(/\n/g, " ").slice(0, 100).trim();
      return `${i + 1}. 🔧 ${score}% ${tool}${lang} | ${r.project_name} | ${preview}… [id:${r.event_id}]`;
    });

    const text = [
      `Code search: ${result.total} results in ${result.latency_ms}ms:`,
      "",
      ...lines,
      "",
      "Use `detail` with event IDs to see full code content.",
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: code_history (file history across sessions)
// ==========================================

server.registerTool(
  "code_history",
  {
    title: "Code History",
    description:
      "Find all past interactions with a specific file across all sessions: reads, edits, errors, discussions. Shows how the file evolved over time.",
    inputSchema: z.object({
      file_path: z.string().describe("File path or partial path (e.g. 'src/auth.ts', 'middleware')"),
      limit: z.number().min(1).max(30).default(15).describe("Max results"),
    }),
  },
  async (args) => {
    const result = await client.search(`file ${args.file_path}`, {
      limit: args.limit,
      threshold: 0.3,
      filters: {
        content_types: ["tool_call", "tool_result", "error"],
        tool_names: ["Read", "Edit", "Write", "Bash"],
      },
    });

    if (result.results.length === 0) {
      return { content: [{ type: "text" as const, text: `No history found for "${args.file_path}".` }] };
    }

    const lines = result.results.map((r: any, i: number) => {
      const tool = r.tool_name || "?";
      const action = tool === "Read" ? "📖 read" : tool === "Edit" ? "✏️ edit" : tool === "Write" ? "📝 write" : tool === "Bash" ? "⚡ run" : `🔧 ${tool}`;
      const date = new Date(r.created_at).toLocaleDateString();
      const preview = r.content.replace(/\n/g, " ").slice(0, 80).trim();
      return `${i + 1}. ${action} | ${date} | ${r.project_name} | ${preview}… [id:${r.event_id}]`;
    });

    const text = [
      `History for "${args.file_path}" — ${result.total} interactions:`,
      "",
      ...lines,
      "",
      "Use `detail` with event IDs to see full content.",
    ].join("\n");

    return { content: [{ type: "text" as const, text }] };
  }
);

// ==========================================
// Tool: productivity
// ==========================================

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

server.registerTool(
  "productivity",
  {
    title: "Productivity Metrics",
    description:
      "Personal developer productivity metrics: sessions, tokens, tools used, files touched, activity patterns, error rates. Like WakaTime but for AI-assisted coding.",
    inputSchema: z.object({
      period: z.enum(["day", "week", "month"]).default("week").describe("Time period"),
      project_id: z.string().optional().describe("Filter by project ID"),
    }),
  },
  async (args) => {
    try {
      const d = await client.getProductivity(args.period, args.project_id);

      const lines: string[] = [];
      lines.push(`## Productivity Report (last ${d.period || args.period})`);
      lines.push(`_${d.date_from} → ${d.date_to}_\n`);

      // Sessions
      lines.push(`### Sessions`);
      lines.push(`**${d.sessions.count}** sessions, **${d.sessions.total_duration_minutes}** min total (avg ${d.sessions.avg_duration_minutes} min)\n`);

      // Tokens
      lines.push(`### Tokens`);
      lines.push(`**${d.tokens.formatted}** total (${formatNumber(d.tokens.input)} in, ${formatNumber(d.tokens.output)} out)\n`);

      // Tools
      if (d.tools.total_calls > 0) {
        lines.push(`### Tools (${d.tools.total_calls} calls)`);
        const toolEntries = Object.entries(d.tools.by_name as Record<string, number>)
          .sort(([, a], [, b]) => b - a);
        lines.push(toolEntries.map(([name, count]) => `**${name}** (${count})`).join(", "));
        lines.push("");
      }

      // Top Files
      if (d.files.top_10?.length > 0) {
        lines.push(`### Top Files (${d.files.unique_count} unique)`);
        for (const f of d.files.top_10) {
          // Shorten absolute paths
          const short = (f.path as string).replace(/.*\/([^/]+\/[^/]+\/[^/]+)$/, "$1");
          lines.push(`- **${short}** — ${f.interactions}x`);
        }
        lines.push("");
      }

      // Languages
      if (d.languages?.by_name) {
        const langEntries = Object.entries(d.languages.by_name as Record<string, number>)
          .sort(([, a], [, b]) => b - a);
        if (langEntries.length > 0) {
          lines.push(`### Languages`);
          lines.push(langEntries.map(([lang, count]) => `${lang} (${count})`).join(", "));
          lines.push("");
        }
      }

      // Activity
      lines.push(`### Activity`);
      const hour = String(d.activity.most_active_hour).padStart(2, "0") + ":00";
      lines.push(`Peak hour: **${hour}** | Peak day: **${d.activity.most_active_day}**`);
      // Sparkline-style hour chart
      const maxH = Math.max(...d.activity.by_hour, 1);
      const bars = d.activity.by_hour.map((h: number) => {
        const level = Math.round((h / maxH) * 4);
        return ["·", "▁", "▂", "▃", "▄"][level] || "▄";
      }).join("");
      lines.push(`\`${bars}\` (0h → 23h)`);
      lines.push("");

      // Turns
      lines.push(`### Turns`);
      lines.push(`**${d.turns.count}** turns (avg ${d.turns.avg_per_session}/session)\n`);

      // Errors
      lines.push(`### Errors`);
      const ratePercent = (d.errors.rate * 100).toFixed(1);
      lines.push(`**${d.errors.count}** errors (${ratePercent}% rate)`);

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (err) {
      return {
        content: [{
          type: "text" as const,
          text: `Failed to fetch productivity metrics: ${err instanceof Error ? err.message : "Unknown error"}`,
        }],
      };
    }
  }
);

// ==========================================
// Tool: knowledge
// ==========================================

server.registerTool(
  "knowledge",
  {
    title: "Project Knowledge Base",
    description:
      "Search the accumulated knowledge about your project: past explanations, architectural decisions, debugging sessions, setup guides. Answers questions like 'how does the auth system work?' from past conversations.",
    inputSchema: z.object({
      query: z.string().describe("What do you want to know? Natural language question about the project."),
      scope: z.enum(["all", "decisions", "explanations", "debugging", "setup"]).default("all").describe("Filter by knowledge type"),
      project_id: z.string().optional().describe("Filter by project"),
      limit: z.number().min(1).max(20).default(5).describe("Max results"),
    }),
  },
  async (args) => {
    // Build smart filters based on scope
    const filters: any = {};
    let query = args.query;

    switch (args.scope) {
      case "decisions":
        query = `${args.query} because chose decided tradeoff`;
        filters.content_types = ["user_prompt", "ai_output"];
        break;
      case "explanations":
        filters.content_types = ["ai_output"];
        break;
      case "debugging":
        filters.content_types = ["error", "tool_result"];
        filters.tool_names = ["Bash"];
        break;
      case "setup":
        query = `${args.query} setup install configure`;
        break;
      // "all" — no content_type filter
    }

    if (args.project_id) {
      filters.project_id = args.project_id;
    }

    const result = await client.search(query, {
      limit: args.limit,
      threshold: 0.4,
      filters,
    });

    if (result.results.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: `No knowledge found for "${args.query}" (scope: ${args.scope}). Try broadening the query or changing the scope to "all".`,
        }],
      };
    }

    const lines: string[] = [];
    lines.push(`## Knowledge Base: "${args.query}"`);
    lines.push(`_Scope: ${args.scope} | ${result.total} results_\n`);

    for (const [i, r] of (result.results as any[]).entries()) {
      const score = (r.score * 100).toFixed(0);
      const date = new Date(r.created_at).toLocaleDateString();
      const icon =
        { user_prompt: "\u{1F4AC}", ai_output: "\u{1F916}", tool_call: "\u{1F4E4}", tool_result: "\u{1F527}", error: "\u274C" }[
          r.content_type as string
        ] || "\u{1F4C4}";
      const preview = r.content.replace(/\n/g, " ").slice(0, 200).trim();
      lines.push(`### ${i + 1}. ${icon} ${r.content_type} — ${score}% match`);
      lines.push(`**Project:** ${r.project_name} | **Date:** ${date}`);
      lines.push(`${preview}...`);
      lines.push(`_[id:${r.event_id}]_\n`);
    }

    lines.push("Use `detail` with event IDs to read full content.");

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ==========================================
// Tool: onboard
// ==========================================

server.registerTool(
  "onboard",
  {
    title: "Project Onboarding Guide",
    description:
      "Generate a project overview from accumulated session history: architecture, key files, common tasks, past gotchas, tech stack. Great for getting up to speed on a project.",
    inputSchema: z.object({
      project_id: z.string().optional().describe("Project ID. If not specified, uses current project."),
    }),
  },
  async (args) => {
    try {
      const headers: Record<string, string> = {};
      if (config.connection.apiKey)
        headers["Authorization"] = `Bearer ${config.connection.apiKey}`;

      // 1. Get stats for overall context
      const statsRes = await fetch(`${config.connection.endpoint}/api/v1/stats`, { headers });
      const stats = (await statsRes.json()) as any;

      // Determine project info
      let projectName = "Unknown";
      let projectInfo: any = null;
      if (args.project_id) {
        const projArr = stats.by_project || [];
        projectInfo = projArr.find((p: any) => p.id === args.project_id);
        if (projectInfo) projectName = projectInfo.name;
      } else if (stats.by_project?.length) {
        // Use the project with the most events
        projectInfo = stats.by_project.reduce((a: any, b: any) =>
          (a.event_count || 0) > (b.event_count || 0) ? a : b
        );
        projectName = projectInfo.name;
      }

      const filters: any = {};
      if (args.project_id) filters.project_id = args.project_id;

      // 2. Search for architecture/setup content
      const archResults = await client.search("architecture setup configuration structure", {
        limit: 5,
        threshold: 0.3,
        filters: { ...filters, content_types: ["ai_output"] },
      });

      // 3. Search for common errors
      const errorResults = await client.search("error bug fix", {
        limit: 5,
        threshold: 0.3,
        filters: { ...filters, content_types: ["error"] },
      });

      // 4. Search for common tasks / user prompts
      const taskResults = await client.search("implement add create fix update", {
        limit: 5,
        threshold: 0.3,
        filters: { ...filters, content_types: ["user_prompt"] },
      });

      // 5. Format as onboarding guide
      const lines: string[] = [];
      lines.push(`## Project Onboarding: ${projectName}`);
      lines.push("");

      // Overview
      lines.push(`### Overview`);
      if (projectInfo) {
        lines.push(`- **Sessions:** ${projectInfo.session_count || 0}`);
        lines.push(`- **Events:** ${projectInfo.event_count || 0}`);
      } else {
        lines.push(`- **Total Sessions:** ${stats.total_sessions || 0}`);
        lines.push(`- **Total Events:** ${stats.total_events || 0}`);
      }
      lines.push(`- **Total Projects:** ${stats.total_projects || 0}`);
      lines.push("");

      // Key Files
      if (stats.total_files) {
        lines.push(`### Key Files (most interacted)`);
        lines.push(`_${stats.total_files} files tracked across all sessions_`);
        lines.push("");
      }

      // Tech Stack
      const languages = Object.entries(stats.by_language || {});
      if (languages.length > 0) {
        lines.push(`### Tech Stack`);
        for (const [lang, count] of languages) {
          lines.push(`- **${lang}**: ${count} interactions`);
        }
        lines.push("");
      }

      // Top Tools
      const toolEntries = Object.entries(stats.by_tool || {}).slice(0, 10);
      if (toolEntries.length > 0) {
        lines.push(`### Tools Used`);
        for (const [tool, count] of toolEntries) {
          lines.push(`- **${tool}**: ${count}`);
        }
        lines.push("");
      }

      // Common Tasks
      if (taskResults.results.length > 0) {
        lines.push(`### Common Tasks`);
        lines.push(`_From frequent user prompts:_`);
        for (const r of taskResults.results as any[]) {
          const preview = r.content.replace(/\n/g, " ").slice(0, 120).trim();
          lines.push(`- ${preview}`);
        }
        lines.push("");
      }

      // Known Gotchas
      if (errorResults.results.length > 0) {
        lines.push(`### Known Gotchas`);
        lines.push(`_From past error events:_`);
        for (const r of errorResults.results as any[]) {
          const preview = r.content.replace(/\n/g, " ").slice(0, 120).trim();
          lines.push(`- ${preview}`);
        }
        lines.push("");
      }

      // Architecture Notes
      if (archResults.results.length > 0) {
        lines.push(`### Architecture Notes`);
        lines.push(`_From past AI explanations:_`);
        for (const r of archResults.results as any[]) {
          const preview = r.content.replace(/\n/g, " ").slice(0, 200).trim();
          lines.push(`- ${preview}`);
        }
        lines.push("");
      }

      if (lines.length <= 5) {
        lines.push("_Not enough session history to generate a full onboarding guide yet. Keep using Claude Code and check back later._");
      }

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (err) {
      return {
        content: [{
          type: "text" as const,
          text: `Failed to generate onboarding guide: ${err instanceof Error ? err.message : "Unknown error"}`,
        }],
      };
    }
  }
);

// ==========================================
// Tool: mistakes
// ==========================================

server.registerTool("mistakes", {
  title: "Mistake Memory",
  description: "Find past error→fix patterns: when an error was followed by a code fix. Helps avoid repeating the same mistakes. Shows what went wrong and how it was fixed.",
  inputSchema: z.object({
    project_id: z.string().optional().describe("Filter by project ID"),
    limit: z.number().min(1).max(20).default(10).describe("Max results"),
  }),
}, async (args) => {
  const data = await client.getMistakes({ project_id: args.project_id, limit: args.limit });

  if (!data.pairs?.length) {
    return { content: [{ type: "text" as const, text: "No error→fix patterns found yet. Errors that are followed by edits in the same session will appear here." }] };
  }

  const lines: string[] = [];
  lines.push(`## Mistake Memory — ${data.total_pairs} error→fix pairs (${(data.fix_rate * 100).toFixed(0)}% fix rate)\n`);

  for (const p of data.pairs) {
    const errPreview = (p.error_content || "").slice(0, 100).replace(/\n/g, " ");
    const fixPreview = (p.fix_preview || "").slice(0, 100).replace(/\n/g, " ");
    lines.push(`### Error [${p.error_tool}]`);
    lines.push(`\`${errPreview}\``);
    lines.push(`**Fix** [${p.fix_tool}] → ${p.fix_file || "?"}`);
    lines.push(`\`${fixPreview}\``);
    lines.push(`_${p.project_name} | ${p.created_at}_\n`);
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
});

// ==========================================
// Tool: debt
// ==========================================

server.registerTool("debt", {
  title: "Tech Debt Tracker",
  description: "Identify technical debt: files that change too often (churn hotspots), TODO/FIXME/HACK markers, recurring errors, and an overall debt score.",
  inputSchema: z.object({
    project_id: z.string().optional().describe("Filter by project ID"),
  }),
}, async (args) => {
  const data = await client.getDebt({ project_id: args.project_id });

  const lines: string[] = [];
  lines.push(`## Tech Debt Report — Score: ${data.churn_score}/100\n`);

  // Hotspots
  if (data.hotspots?.length > 0) {
    lines.push("### Churn Hotspots (most frequently modified files)");
    for (const h of data.hotspots.slice(0, 10)) {
      const short = (h.file_path as string).replace(/.*\/([^/]+\/[^/]+\/[^/]+)$/, "$1");
      const errTag = h.error_count > 0 ? ` | ${h.error_count} errors` : "";
      lines.push(`- **${short}** — ${h.touch_count}x across ${h.session_count} sessions${errTag}`);
    }
    lines.push("");
  }

  // Debt markers
  if (data.debt_markers?.length > 0) {
    lines.push("### Debt Markers (TODO/FIXME/HACK found in code)");
    for (const m of data.debt_markers.slice(0, 10)) {
      const preview = (m.content_preview || "").replace(/\n/g, " ").slice(0, 80);
      const file = m.file_path ? ` (${m.file_path.replace(/.*\//, "")})` : "";
      lines.push(`- \`${preview}\`${file}`);
    }
    lines.push("");
  }

  // Recurring errors
  if (data.recurring_errors?.length > 0) {
    lines.push("### Recurring Errors");
    for (const e of data.recurring_errors.slice(0, 10)) {
      lines.push(`- **${e.occurrences}x** \`${e.pattern}\` (last: ${e.last_seen})`);
    }
    lines.push("");
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
});

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
// Tool: entities (#68 — Entity Search)
// ==========================================

server.registerTool("entities", {
  title: "Entity Search",
  description: "Search extracted entities: file paths, function/class names, package names, error types. Find all events related to a specific entity across all sessions.",
  inputSchema: z.object({
    name: z.string().optional().describe("Search entities by name (partial match). E.g. 'authMiddleware', 'hook-handler.ts', 'TypeError'"),
    type: z.enum(["file", "function", "package", "error_type"]).optional().describe("Filter by entity type"),
    project_id: z.string().optional().describe("Filter by project ID"),
    limit: z.number().min(1).max(50).default(20).describe("Max results"),
  }),
}, async (args) => {
  try {
    const data = await client.getEntities({
      name: args.name,
      type: args.type,
      project_id: args.project_id,
      limit: args.limit,
    });

    // If searching by name → show matching events
    if (args.name && data.results) {
      if (!data.results.length) {
        return { content: [{ type: "text" as const, text: `No events found with entity matching "${args.name}".` }] };
      }
      const lines: string[] = [];
      lines.push(`## Events with entity "${args.name}" (${data.total} results)\n`);
      for (const r of data.results) {
        const tool = r.tool_name ? ` [${r.tool_name}]` : "";
        const preview = (r.content_preview || "").replace(/\n/g, " ").slice(0, 80);
        const ents = (r.entities || []).map((e: any) => `${e.type}:${e.name}`).slice(0, 5).join(", ");
        lines.push(`- **${r.content_type}**${tool} | ${r.project_name} | ${r.created_at.slice(0, 10)}`);
        lines.push(`  ${preview}`);
        lines.push(`  _Entities: ${ents}_ [id:${r.event_id}]\n`);
      }
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }

    // Otherwise → show aggregated entity list
    if (!data.entities?.length) {
      return { content: [{ type: "text" as const, text: "No entities extracted yet. Entities are extracted from new events at ingest time." }] };
    }
    const lines: string[] = [];
    const typeFilter = args.type ? ` (type: ${args.type})` : "";
    lines.push(`## Entities${typeFilter} — ${data.total} unique\n`);
    for (const e of data.entities) {
      lines.push(`- **${e.name}** (${e.type}) — ${e.occurrences}x`);
    }
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (err) {
    return { content: [{ type: "text" as const, text: `Failed to fetch entities: ${err instanceof Error ? err.message : "Unknown"}` }] };
  }
});

// ==========================================
// Tool: decisions (#71 — Decision Journal)
// ==========================================

server.registerTool("decisions", {
  title: "Decision Journal",
  description: "List architectural decisions detected in past conversations. Finds statements like 'we chose X because Y', 'decided to use Z instead of W'. Decisions are auto-tagged during ingestion.",
  inputSchema: z.object({
    project_id: z.string().optional().describe("Filter by project ID"),
    limit: z.number().min(1).max(30).default(10).describe("Max decisions to return"),
  }),
}, async (args) => {
  try {
    const data = await client.getDecisions({ project_id: args.project_id, limit: args.limit });

    if (!data.decisions?.length) {
      return { content: [{ type: "text" as const, text: "No decisions found yet. Decisions are auto-detected in AI outputs containing phrases like 'chose X because', 'decided to', 'instead of', etc." }] };
    }

    const lines: string[] = [];
    lines.push(`## Decision Journal — ${data.total} decision(s)\n`);

    for (const [i, d] of (data.decisions as any[]).entries()) {
      const date = new Date(d.created_at).toLocaleDateString();
      const preview = (d.content_preview || "").replace(/\n/g, " ").slice(0, 200).trim();
      lines.push(`### ${i + 1}. ${d.project_name} — ${date}`);
      lines.push(`${preview}...`);
      lines.push(`_[id:${d.event_id}]_\n`);
    }

    lines.push("Use `detail` with event IDs to read the full decision context.");

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (err) {
    return {
      content: [{
        type: "text" as const,
        text: `Failed to fetch decisions: ${err instanceof Error ? err.message : "Unknown error"}`,
      }],
    };
  }
});

// ==========================================
// Start server
// ==========================================

const transport = new StdioServerTransport();
await server.connect(transport);
