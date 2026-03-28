#!/usr/bin/env node

import { loadConfig } from "./config";
import { RagApiClient } from "./api-client";
import type { RawEvent } from "@claude-rag/shared";

// ==========================================
// Types for Claude Code hook stdin payloads
// ==========================================

interface HookBase {
  session_id: string;
  transcript_path?: string;
  cwd?: string;
  permission_mode?: string;
  hook_event_name: string;
  agent_id?: string;
  agent_type?: string;
}

interface UserPromptSubmitHook extends HookBase {
  hook_event_name: "UserPromptSubmit";
  prompt: string;
}

interface PostToolUseHook extends HookBase {
  hook_event_name: "PostToolUse";
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response: unknown;
  tool_use_id: string;
}

interface PostToolUseFailureHook extends HookBase {
  hook_event_name: "PostToolUseFailure";
  tool_name: string;
  tool_input: Record<string, unknown>;
  error: string;
  is_interrupt?: boolean;
}

interface StopHook extends HookBase {
  hook_event_name: "Stop";
  stop_hook_active?: boolean;
  last_assistant_message?: string;
}

interface SubagentStopHook extends HookBase {
  hook_event_name: "SubagentStop";
  agent_transcript_path?: string;
  last_assistant_message?: string;
}

interface SessionStartHook extends HookBase {
  hook_event_name: "SessionStart";
  source?: string;
  model?: string;
}

type HookPayload =
  | UserPromptSubmitHook
  | PostToolUseHook
  | PostToolUseFailureHook
  | StopHook
  | SubagentStopHook
  | SessionStartHook;

// ==========================================
// Main entry point
// ==========================================

async function main(): Promise<void> {
  const stdin = await readStdin();
  if (!stdin) process.exit(0);

  const config = loadConfig();
  if (!config.capture.enabled) process.exit(0);

  // Skip if no API key configured (not set up yet)
  if (!config.connection.apiKey) process.exit(0);

  const client = new RagApiClient({
    endpoint: config.connection.endpoint,
    apiKey: config.connection.apiKey,
    timeoutMs: 4000,
  });

  const projectName = detectProject(stdin.cwd);
  const hookEvent = stdin.hook_event_name;

  // Extract turn_id + token usage from transcript (safe — never throws)
  let txInfo: TranscriptInfo = {};
  let turnId: string | undefined;
  try {
    if (stdin.transcript_path) {
      txInfo = await readTranscriptInfo(stdin.transcript_path);
      turnId = txInfo.promptId;
    }
  } catch {
    // Transcript read failed — continue without turn_id
  }

  try {
    switch (hookEvent) {
      case "UserPromptSubmit":
        await handleUserPrompt(stdin as UserPromptSubmitHook, client, config, projectName, turnId);
        break;
      case "PostToolUse":
        await handleToolUse(stdin as PostToolUseHook, client, config, projectName, turnId);
        break;
      case "PostToolUseFailure":
        await handleToolFailure(stdin as PostToolUseFailureHook, client, config, projectName, turnId);
        break;
      case "Stop":
        await handleStop(stdin as StopHook, client, config, projectName, turnId, txInfo);
        break;
      case "SubagentStop":
        await handleSubagentStop(stdin as SubagentStopHook, client, config, projectName, turnId);
        break;
      case "SessionStart":
        await handleSessionStart(stdin as SessionStartHook, client, config, projectName);
        break;
    }
  } catch {
    // Silently fail — never block Claude Code
  }

  process.exit(0);
}

// ==========================================
// Hook handlers
// ==========================================

async function handleUserPrompt(
  stdin: UserPromptSubmitHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string,
  turnId?: string
): Promise<void> {
  // Skip RAG for plugin commands
  const isCommand = stdin.prompt.startsWith("/claude-rag:");

  // 1. Save prompt to temp file — will be sent with turn_id at Stop time
  // (transcript doesn't have the promptId yet at UserPromptSubmit)
  if (config.capture.userPrompts && !isCommand) {
    try {
      const { writeFileSync, mkdirSync } = await import("node:fs");
      const tmpDir = "/tmp/claude-rag";
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(`${tmpDir}/pending-${stdin.session_id}.json`, JSON.stringify({
        event: buildEvent(stdin, "user_prompt", stdin.prompt),
        project,
      }));
    } catch {}
  }

  // 2. Auto RAG injection (skip for plugin commands)
  if (
    !isCommand &&
    (config.rag.mode === "auto" || config.rag.mode === "aggressive")
  ) {
    if (config.rag.perPrompt.enabled) {
      try {
        const result = await client.search(stdin.prompt, {
          limit: config.rag.perPrompt.maxItems,
          threshold: config.rag.threshold,
        });

        if (result.results && result.results.length > 0) {
          // Build additionalContext for Claude (full details)
          const context = formatResultsForClaude(result.results, config.rag.maxContextTokens);

          // Build visible summary for the user
          const summary = formatResultsSummary(result.results, result.latency_ms);

          process.stdout.write(
            JSON.stringify({
              additionalContext: context,
              systemMessage: summary,
            })
          );
        }
      } catch {
        // Timeout or error — no context injected, that's fine
      }
    }
  }
}

async function handleToolUse(
  stdin: PostToolUseHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string,
  turnId?: string
): Promise<void> {
  if (config.capture.exclude.tools.includes(stdin.tool_name)) return;

  const events: RawEvent[] = [];

  if (config.capture.toolCalls) {
    events.push(
      buildEvent(stdin, "tool_call", JSON.stringify(stdin.tool_input), {
        tool_name: stdin.tool_name,
        tool_input: stdin.tool_input,
        turnId,
      })
    );
  }

  if (config.capture.toolResults) {
    const content =
      typeof stdin.tool_response === "string"
        ? stdin.tool_response
        : JSON.stringify(stdin.tool_response);

    const filePath = stdin.tool_input?.file_path as string | undefined;
    const hasFile = isFileContent(stdin.tool_name, filePath);

    events.push(
      buildEvent(stdin, "tool_result", content, {
        tool_name: stdin.tool_name,
        tool_input: stdin.tool_input,
        has_file: hasFile,
        file_path: filePath,
        turnId,
      })
    );
  }

  if (events.length > 0) {
    await client.ingest(events, project);
  }
}

async function handleToolFailure(
  stdin: PostToolUseFailureHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string,
  turnId?: string
): Promise<void> {
  if (!config.capture.toolCalls) return;
  if (config.capture.exclude.tools.includes(stdin.tool_name)) return;

  await client.ingest(
    [
      buildEvent(stdin, "error", `Tool ${stdin.tool_name} failed: ${stdin.error}`, {
        tool_name: stdin.tool_name,
        tool_input: stdin.tool_input,
        turnId,
      }),
    ],
    project
  );
}

async function handleStop(
  stdin: StopHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string,
  turnId?: string,
  txInfo?: TranscriptInfo
): Promise<void> {
  if (!config.capture.aiOutputs) return;
  if (!stdin.last_assistant_message) return;

  // Token usage from transcript
  const tokenMeta = txInfo?.outputTokens ? {
    input_tokens: txInfo.inputTokens,
    output_tokens: txInfo.outputTokens,
    cache_read_tokens: txInfo.cacheReadTokens,
    model: txInfo.model,
  } : undefined;

  const events: RawEvent[] = [];
  let ingestProject = project;

  // 1. Recover the pending user_prompt (saved at UserPromptSubmit time)
  try {
    const { readFileSync, unlinkSync } = await import("node:fs");
    const pendingFile = `/tmp/claude-rag/pending-${stdin.session_id}.json`;
    const raw = readFileSync(pendingFile, "utf-8");
    const pending = JSON.parse(raw);
    pending.event.turn_id = turnId;
    if (tokenMeta) {
      pending.event.metadata = { ...pending.event.metadata, tokens: tokenMeta };
    }
    events.push(pending.event);
    if (pending.project) ingestProject = pending.project;
    unlinkSync(pendingFile);
  } catch {
    // No pending prompt
  }

  // 2. Add the ai_output with token count
  const aiEvent = buildEvent(stdin, "ai_output", stdin.last_assistant_message, { turnId });
  if (tokenMeta) {
    aiEvent.metadata = { ...aiEvent.metadata, tokens: tokenMeta };
  }
  events.push(aiEvent);

  await client.ingest(events, ingestProject);
}

async function handleSubagentStop(
  stdin: SubagentStopHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string,
  turnId?: string
): Promise<void> {
  if (!config.capture.subAgents) return;
  if (!stdin.last_assistant_message) return;

  await client.ingest(
    [
      buildEvent(stdin, "ai_output", stdin.last_assistant_message, {
        is_sub_agent_override: true,
        turnId,
      }),
    ],
    project
  );
}

async function handleSessionStart(
  stdin: SessionStartHook,
  client: RagApiClient,
  config: ReturnType<typeof loadConfig>,
  project: string
): Promise<void> {
  // Skip if not configured or no API key
  if (!config.connection.apiKey) return;

  // Inject project context at session start
  if (
    config.rag.mode === "auto" ||
    config.rag.mode === "aggressive"
  ) {
    if (config.rag.sessionStart.enabled) {
      try {
        const result = await client.search(
          `recent project context summary ${project}`,
          {
            limit: config.rag.sessionStart.maxItems,
            threshold: config.rag.threshold,
          }
        );

        if (result.results && result.results.length > 0) {
          const context = formatResultsForClaude(result.results, config.rag.maxContextTokens);
          const summary = `Claude RAG — loaded ${result.results.length} context${result.results.length > 1 ? "s" : ""} from "${project}"`;

          process.stdout.write(
            JSON.stringify({
              additionalContext: context,
              systemMessage: summary,
            })
          );
        }
      } catch {
        // Silently fail
      }
    }
  }
}

// ==========================================
// Helpers
// ==========================================

function buildEvent(
  stdin: HookBase,
  contentType: RawEvent["content_type"],
  content: string,
  extra?: {
    tool_name?: string;
    tool_input?: Record<string, unknown>;
    has_file?: boolean;
    file_path?: string;
    is_sub_agent_override?: boolean;
    turnId?: string;
  }
): RawEvent {
  const agentType = stdin.agent_type || "main";
  const isSubAgent =
    extra?.is_sub_agent_override ??
    (agentType !== "main" && agentType !== undefined && !!stdin.agent_type);

  return {
    session_id: stdin.session_id,
    agent_id: stdin.agent_id || "main",
    content_type: contentType,
    content,
    tool_name: extra?.tool_name,
    tool_input: extra?.tool_input,
    agent_type: agentType,
    is_sub_agent: isSubAgent,
    has_file: extra?.has_file,
    file_path: extra?.file_path,
    hook_event_name: stdin.hook_event_name,
    timestamp: new Date().toISOString(),
    turn_id: extra?.turnId,
  };
}

interface TranscriptInfo {
  promptId?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  model?: string;
}

/**
 * Extract promptId + token usage from the transcript.
 * Reads last 10KB, scans from end.
 * Fast: ~2-5ms
 */
async function readTranscriptInfo(transcriptPath: string): Promise<TranscriptInfo> {
  const info: TranscriptInfo = {};
  try {
    const { statSync, openSync, readSync, closeSync } = await import("node:fs");
    const stat = statSync(transcriptPath);
    if (stat.size === 0) return info;

    const TAIL_BYTES = 10_000;
    const fd = openSync(transcriptPath, "r");
    const start = Math.max(0, stat.size - TAIL_BYTES);
    const buf = Buffer.alloc(Math.min(TAIL_BYTES, stat.size));
    readSync(fd, buf, 0, buf.length, start);
    closeSync(fd);

    const tail = buf.toString("utf-8");
    const lines = tail.split("\n").filter(l => l.trim());
    if (start > 0) lines.shift();

    // Scan from end
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const m = JSON.parse(lines[i]);

        // Get promptId from latest user message
        if (!info.promptId && m.promptId && m.type === "user") {
          info.promptId = m.promptId;
        }

        // Get token usage from latest assistant message with usage
        if (!info.outputTokens && m.message?.usage) {
          const u = m.message.usage;
          info.inputTokens = u.input_tokens;
          info.outputTokens = u.output_tokens;
          info.cacheReadTokens = u.cache_read_input_tokens;
        }

        // Get model
        if (!info.model && m.message?.model) {
          info.model = m.message.model;
        }

        // Stop once we have everything
        if (info.promptId && info.outputTokens) break;
      } catch {
        // skip
      }
    }
  } catch {
    // ignore
  }
  return info;
}

/** Compat wrapper for places that just need the promptId */
async function getPromptIdFromTranscript(transcriptPath: string): Promise<string | undefined> {
  const info = await readTranscriptInfo(transcriptPath);
  return info.promptId;
}

function detectProject(cwd?: string): string {
  if (!cwd) return "unknown";
  // Use the last directory name as project name
  const parts = cwd.split("/").filter(Boolean);
  return parts[parts.length - 1] || "unknown";
}

const FILE_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "webp", "ico",
  "pdf",
  "mp3", "wav", "ogg", "flac",
  "mp4", "webm", "avi", "mov",
]);

function isFileContent(toolName: string, filePath?: string): boolean {
  if (toolName !== "Read" || !filePath) return false;
  const ext = filePath.split(".").pop()?.toLowerCase();
  return ext ? FILE_EXTENSIONS.has(ext) : false;
}

async function readStdin(): Promise<HookPayload | null> {
  // In Node/Bun, read from stdin
  if (process.stdin.isTTY) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as HookPayload;
  } catch {
    return null;
  }
}

// ==========================================
// RAG Result Formatting
// ==========================================

/** Format results as additionalContext for Claude (full details, invisible to user) */
function formatResultsForClaude(results: any[], maxTokens: number): string {
  let output = "[RAG] Relevant context from past conversations:\n\n";
  let tokens = 15;

  for (const r of results) {
    const prefix = {
      user_prompt: "Prompt",
      ai_output: "AI Response",
      tool_call: `Tool call: ${r.tool_name || "unknown"}`,
      tool_result: `Result: ${r.tool_name || "unknown"}`,
      error: "Error",
    }[r.content_type] || r.content_type;

    const entry = `- [${prefix}] (score: ${r.score.toFixed(2)}, project: ${r.project_name})\n  ${r.content.slice(0, 500)}\n`;
    const entryTokens = Math.ceil(entry.length / 4);
    if (tokens + entryTokens > maxTokens) break;
    output += entry + "\n";
    tokens += entryTokens;
  }

  return output;
}

/** Format a visible summary for the user (shown as system message in conversation) */
function formatResultsSummary(results: any[], latencyMs?: number): string {
  const icons: Record<string, string> = {
    user_prompt: "💬",
    ai_output: "🤖",
    tool_call: "📤",
    tool_result: "🔧",
    error: "❌",
  };

  const topResults = results.slice(0, 3);
  const lines = topResults.map((r) => {
    const score = Math.round(r.score * 100);
    const content = r.content || "";

    // Turn format: Q: ... Tools: ... A: ...
    const hasQ = content.includes("Q: ");
    const hasA = content.includes("\n\nA: ");
    const hasTools = content.includes("\n\nTools: ");

    if (hasQ && hasA) {
      const qMatch = content.match(/Q: (.+?)(?:\n|$)/);
      const q = qMatch ? qMatch[1].slice(0, 60) : "";

      let toolLine = "";
      if (hasTools) {
        const tMatch = content.match(/Tools: (.+?)(?:\n|$)/);
        if (tMatch) toolLine = `\n     🔧 ${tMatch[1]}`;
      }

      // Extract the token info from backend format: "A: preview... (247 tokens)" or "(3.2k tokens)"
      const aPart = content.split("\n\nA: ")[1] || "";
      const tokenMatch = aPart.match(/\((\d+(?:\.\d+)?k?) tokens\)/);
      const tokenStr = tokenMatch ? tokenMatch[1] : "";

      // Get preview text (before the token count)
      const aText = aPart.replace(/\s*\(\d+(?:\.\d+)?k? tokens\)$/, "").replace(/\.\.\.$/, "").replace(/\n/g, " ").trim();
      const aPreview = aText.slice(0, 60);
      const tokenDisplay = tokenStr ? ` (${tokenStr} tokens)` : "";

      return `  💬 ${score}% — Q: ${q}${toolLine}\n     🤖 A: ${aPreview}${aText.length > 60 ? "..." : ""}${tokenDisplay}`;
    }

    // Regular format (no turn)
    const icon = icons[r.content_type] || "📄";
    const tool = r.tool_name ? ` ${r.tool_name}` : "";
    const sub = r.is_sub_agent ? " (sub-agent)" : "";
    const preview = content.replace(/\n/g, " ").slice(0, 80).trim();
    return `  ${icon} ${score}%${tool}${sub} — ${preview}`;
  });

  const more = results.length > 3 ? `  ... +${results.length - 3} more` : "";
  const time = latencyMs ? ` (${latencyMs}ms)` : "";

  return `🔍 RAG found ${results.length} match${results.length > 1 ? "es" : ""}${time}\n${lines.join("\n")}${more ? "\n" + more : ""}`;
}

// Run
main();
