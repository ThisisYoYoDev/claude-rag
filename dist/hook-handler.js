#!/usr/bin/env node
// @bun
var __require = import.meta.require;
// ../packages/shared/src/labels.ts
var LABELS = {
  USER_PROMPT: 1,
  AI_OUTPUT: 2,
  TOOL_CALL: 3,
  TOOL_RESULT: 4,
  ERROR: 5,
  CAT_FILE: 50,
  CAT_CODE: 51,
  CAT_SEARCH: 52,
  CAT_WEB: 53,
  CAT_MCP: 54,
  CAT_SYSTEM: 55,
  TOOL_READ: 100,
  TOOL_WRITE: 101,
  TOOL_EDIT: 102,
  TOOL_BASH: 103,
  TOOL_GREP: 104,
  TOOL_GLOB: 105,
  TOOL_WEBSEARCH: 106,
  TOOL_WEBFETCH: 107,
  TOOL_AGENT: 108,
  TOOL_SKILL: 109,
  TOOL_NOTEBOOK_EDIT: 110,
  TOOL_LSP: 111,
  AGENT_MAIN: 200,
  AGENT_EXPLORE: 201,
  AGENT_PLAN: 202,
  AGENT_GENERAL: 203,
  AGENT_IS_SUB: 210,
  FILE_IMAGE: 250,
  FILE_PDF: 251,
  FILE_CODE: 252,
  FILE_TEXT: 253,
  FILE_AUDIO: 254,
  FILE_VIDEO: 255,
  LANG_TS: 300,
  LANG_PYTHON: 301,
  LANG_RUST: 302,
  LANG_GO: 303,
  LANG_JS: 304,
  LANG_SQL: 305,
  LANG_SHELL: 306,
  LANG_JAVA: 307,
  LANG_CPP: 308,
  LANG_RUBY: 309,
  LANG_PHP: 310,
  LANG_SWIFT: 311,
  LANG_KOTLIN: 312,
  LANG_CSS: 313,
  LANG_HTML: 314,
  LANG_CSHARP: 315,
  LANG_SCALA: 316,
  LANG_ELIXIR: 317,
  LANG_ERLANG: 318,
  LANG_HASKELL: 319,
  LANG_LUA: 320,
  LANG_PERL: 321,
  LANG_R: 322,
  LANG_DART: 323,
  LANG_CLOJURE: 324,
  LANG_VUE: 325,
  LANG_SVELTE: 326,
  LANG_YAML: 327,
  LANG_TOML: 328,
  LANG_JSON: 329,
  LANG_XML: 330,
  LANG_MARKDOWN: 331,
  LANG_DOCKER: 332,
  LANG_TERRAFORM: 333,
  LANG_PROTO: 334,
  LANG_GRAPHQL: 335,
  LANG_ZIG: 336,
  LANG_NIM: 337,
  LANG_OCAML: 338,
  LANG_FSHARP: 339,
  LANG_POWERSHELL: 340,
  LANG_OBJECTIVE_C: 341,
  LANG_GROOVY: 342,
  LANG_JULIA: 343,
  LANG_SOLIDITY: 344,
  LANG_MOVE: 345,
  LANG_CAIRO: 346,
  LANG_NIX: 347,
  LANG_ENV: 348,
  LANG_INI: 349,
  LANG_CSV: 350,
  LANG_PRISMA: 351
};
var CONTENT_TYPE_LABELS = {
  user_prompt: LABELS.USER_PROMPT,
  ai_output: LABELS.AI_OUTPUT,
  tool_call: LABELS.TOOL_CALL,
  tool_result: LABELS.TOOL_RESULT,
  error: LABELS.ERROR
};
var FILE_TOOLS = new Set(["Read", "Write", "Edit", "Glob"]);
var CODE_TOOLS = new Set(["Bash"]);
var SEARCH_TOOLS = new Set(["Grep", "WebSearch"]);
var WEB_TOOLS = new Set(["WebFetch"]);
var TOOL_NAME_LABELS = {
  Read: LABELS.TOOL_READ,
  Write: LABELS.TOOL_WRITE,
  Edit: LABELS.TOOL_EDIT,
  Bash: LABELS.TOOL_BASH,
  Grep: LABELS.TOOL_GREP,
  Glob: LABELS.TOOL_GLOB,
  WebSearch: LABELS.TOOL_WEBSEARCH,
  WebFetch: LABELS.TOOL_WEBFETCH,
  Agent: LABELS.TOOL_AGENT,
  Skill: LABELS.TOOL_SKILL,
  NotebookEdit: LABELS.TOOL_NOTEBOOK_EDIT,
  LSP: LABELS.TOOL_LSP
};
var AGENT_TYPE_LABELS = {
  main: LABELS.AGENT_MAIN,
  Explore: LABELS.AGENT_EXPLORE,
  Plan: LABELS.AGENT_PLAN,
  "general-purpose": LABELS.AGENT_GENERAL
};
var EXT_LANG_MAP = {
  ts: LABELS.LANG_TS,
  tsx: LABELS.LANG_TS,
  mts: LABELS.LANG_TS,
  cts: LABELS.LANG_TS,
  js: LABELS.LANG_JS,
  jsx: LABELS.LANG_JS,
  mjs: LABELS.LANG_JS,
  cjs: LABELS.LANG_JS,
  py: LABELS.LANG_PYTHON,
  pyi: LABELS.LANG_PYTHON,
  pyw: LABELS.LANG_PYTHON,
  pyx: LABELS.LANG_PYTHON,
  ipynb: LABELS.LANG_PYTHON,
  rs: LABELS.LANG_RUST,
  go: LABELS.LANG_GO,
  sql: LABELS.LANG_SQL,
  psql: LABELS.LANG_SQL,
  plsql: LABELS.LANG_SQL,
  sh: LABELS.LANG_SHELL,
  bash: LABELS.LANG_SHELL,
  zsh: LABELS.LANG_SHELL,
  fish: LABELS.LANG_SHELL,
  ksh: LABELS.LANG_SHELL,
  java: LABELS.LANG_JAVA,
  jar: LABELS.LANG_JAVA,
  c: LABELS.LANG_CPP,
  h: LABELS.LANG_CPP,
  cpp: LABELS.LANG_CPP,
  cc: LABELS.LANG_CPP,
  cxx: LABELS.LANG_CPP,
  hpp: LABELS.LANG_CPP,
  hh: LABELS.LANG_CPP,
  hxx: LABELS.LANG_CPP,
  rb: LABELS.LANG_RUBY,
  erb: LABELS.LANG_RUBY,
  rake: LABELS.LANG_RUBY,
  gemspec: LABELS.LANG_RUBY,
  php: LABELS.LANG_PHP,
  phtml: LABELS.LANG_PHP,
  swift: LABELS.LANG_SWIFT,
  kt: LABELS.LANG_KOTLIN,
  kts: LABELS.LANG_KOTLIN,
  css: LABELS.LANG_CSS,
  scss: LABELS.LANG_CSS,
  sass: LABELS.LANG_CSS,
  less: LABELS.LANG_CSS,
  styl: LABELS.LANG_CSS,
  pcss: LABELS.LANG_CSS,
  html: LABELS.LANG_HTML,
  htm: LABELS.LANG_HTML,
  xhtml: LABELS.LANG_HTML,
  cs: LABELS.LANG_CSHARP,
  csx: LABELS.LANG_CSHARP,
  csproj: LABELS.LANG_CSHARP,
  scala: LABELS.LANG_SCALA,
  sc: LABELS.LANG_SCALA,
  sbt: LABELS.LANG_SCALA,
  ex: LABELS.LANG_ELIXIR,
  exs: LABELS.LANG_ELIXIR,
  heex: LABELS.LANG_ELIXIR,
  erl: LABELS.LANG_ERLANG,
  hrl: LABELS.LANG_ERLANG,
  hs: LABELS.LANG_HASKELL,
  lhs: LABELS.LANG_HASKELL,
  lua: LABELS.LANG_LUA,
  pl: LABELS.LANG_PERL,
  pm: LABELS.LANG_PERL,
  r: LABELS.LANG_R,
  rmd: LABELS.LANG_R,
  dart: LABELS.LANG_DART,
  clj: LABELS.LANG_CLOJURE,
  cljs: LABELS.LANG_CLOJURE,
  cljc: LABELS.LANG_CLOJURE,
  edn: LABELS.LANG_CLOJURE,
  vue: LABELS.LANG_VUE,
  svelte: LABELS.LANG_SVELTE,
  yaml: LABELS.LANG_YAML,
  yml: LABELS.LANG_YAML,
  toml: LABELS.LANG_TOML,
  json: LABELS.LANG_JSON,
  jsonc: LABELS.LANG_JSON,
  json5: LABELS.LANG_JSON,
  xml: LABELS.LANG_XML,
  xsl: LABELS.LANG_XML,
  xslt: LABELS.LANG_XML,
  svg: LABELS.LANG_XML,
  plist: LABELS.LANG_XML,
  md: LABELS.LANG_MARKDOWN,
  mdx: LABELS.LANG_MARKDOWN,
  markdown: LABELS.LANG_MARKDOWN,
  dockerfile: LABELS.LANG_DOCKER,
  tf: LABELS.LANG_TERRAFORM,
  tfvars: LABELS.LANG_TERRAFORM,
  hcl: LABELS.LANG_TERRAFORM,
  proto: LABELS.LANG_PROTO,
  graphql: LABELS.LANG_GRAPHQL,
  gql: LABELS.LANG_GRAPHQL,
  zig: LABELS.LANG_ZIG,
  nim: LABELS.LANG_NIM,
  nims: LABELS.LANG_NIM,
  ml: LABELS.LANG_OCAML,
  mli: LABELS.LANG_OCAML,
  fs: LABELS.LANG_FSHARP,
  fsi: LABELS.LANG_FSHARP,
  fsx: LABELS.LANG_FSHARP,
  ps1: LABELS.LANG_POWERSHELL,
  psm1: LABELS.LANG_POWERSHELL,
  psd1: LABELS.LANG_POWERSHELL,
  m: LABELS.LANG_OBJECTIVE_C,
  mm: LABELS.LANG_OBJECTIVE_C,
  groovy: LABELS.LANG_GROOVY,
  gradle: LABELS.LANG_GROOVY,
  jl: LABELS.LANG_JULIA,
  sol: LABELS.LANG_SOLIDITY,
  move: LABELS.LANG_MOVE,
  cairo: LABELS.LANG_CAIRO,
  nix: LABELS.LANG_NIX,
  env: LABELS.LANG_ENV,
  ini: LABELS.LANG_INI,
  cfg: LABELS.LANG_INI,
  conf: LABELS.LANG_INI,
  properties: LABELS.LANG_INI,
  editorconfig: LABELS.LANG_INI,
  csv: LABELS.LANG_CSV,
  tsv: LABELS.LANG_CSV,
  prisma: LABELS.LANG_PRISMA
};
var LABEL_LANG_NAME = {
  [LABELS.LANG_TS]: "typescript",
  [LABELS.LANG_PYTHON]: "python",
  [LABELS.LANG_RUST]: "rust",
  [LABELS.LANG_GO]: "go",
  [LABELS.LANG_JS]: "javascript",
  [LABELS.LANG_SQL]: "sql",
  [LABELS.LANG_SHELL]: "shell",
  [LABELS.LANG_JAVA]: "java",
  [LABELS.LANG_CPP]: "cpp",
  [LABELS.LANG_RUBY]: "ruby",
  [LABELS.LANG_PHP]: "php",
  [LABELS.LANG_SWIFT]: "swift",
  [LABELS.LANG_KOTLIN]: "kotlin",
  [LABELS.LANG_CSS]: "css",
  [LABELS.LANG_HTML]: "html",
  [LABELS.LANG_CSHARP]: "csharp",
  [LABELS.LANG_SCALA]: "scala",
  [LABELS.LANG_ELIXIR]: "elixir",
  [LABELS.LANG_ERLANG]: "erlang",
  [LABELS.LANG_HASKELL]: "haskell",
  [LABELS.LANG_LUA]: "lua",
  [LABELS.LANG_PERL]: "perl",
  [LABELS.LANG_R]: "r",
  [LABELS.LANG_DART]: "dart",
  [LABELS.LANG_CLOJURE]: "clojure",
  [LABELS.LANG_VUE]: "vue",
  [LABELS.LANG_SVELTE]: "svelte",
  [LABELS.LANG_YAML]: "yaml",
  [LABELS.LANG_TOML]: "toml",
  [LABELS.LANG_JSON]: "json",
  [LABELS.LANG_XML]: "xml",
  [LABELS.LANG_MARKDOWN]: "markdown",
  [LABELS.LANG_DOCKER]: "docker",
  [LABELS.LANG_TERRAFORM]: "terraform",
  [LABELS.LANG_PROTO]: "protobuf",
  [LABELS.LANG_GRAPHQL]: "graphql",
  [LABELS.LANG_ZIG]: "zig",
  [LABELS.LANG_NIM]: "nim",
  [LABELS.LANG_OCAML]: "ocaml",
  [LABELS.LANG_FSHARP]: "fsharp",
  [LABELS.LANG_POWERSHELL]: "powershell",
  [LABELS.LANG_OBJECTIVE_C]: "objective-c",
  [LABELS.LANG_GROOVY]: "groovy",
  [LABELS.LANG_JULIA]: "julia",
  [LABELS.LANG_SOLIDITY]: "solidity",
  [LABELS.LANG_MOVE]: "move",
  [LABELS.LANG_CAIRO]: "cairo",
  [LABELS.LANG_NIX]: "nix",
  [LABELS.LANG_ENV]: "env",
  [LABELS.LANG_INI]: "ini",
  [LABELS.LANG_CSV]: "csv",
  [LABELS.LANG_PRISMA]: "prisma"
};
var FILENAME_LANG_MAP = {
  Dockerfile: LABELS.LANG_DOCKER,
  "docker-compose.yml": LABELS.LANG_YAML,
  "docker-compose.yaml": LABELS.LANG_YAML,
  Makefile: LABELS.LANG_SHELL,
  Rakefile: LABELS.LANG_RUBY,
  Gemfile: LABELS.LANG_RUBY,
  Podfile: LABELS.LANG_RUBY,
  Vagrantfile: LABELS.LANG_RUBY,
  Justfile: LABELS.LANG_SHELL,
  CMakeLists: LABELS.LANG_CPP,
  "build.gradle": LABELS.LANG_GROOVY,
  "settings.gradle": LABELS.LANG_GROOVY,
  "flake.nix": LABELS.LANG_NIX,
  ".env": LABELS.LANG_ENV,
  ".env.local": LABELS.LANG_ENV,
  ".env.development": LABELS.LANG_ENV,
  ".env.production": LABELS.LANG_ENV,
  ".env.test": LABELS.LANG_ENV,
  ".env.example": LABELS.LANG_ENV,
  ".gitignore": LABELS.LANG_INI,
  ".dockerignore": LABELS.LANG_INI,
  ".prettierrc": LABELS.LANG_JSON,
  ".eslintrc": LABELS.LANG_JSON,
  "tsconfig.json": LABELS.LANG_JSON,
  "package.json": LABELS.LANG_JSON,
  "composer.json": LABELS.LANG_JSON,
  "Cargo.toml": LABELS.LANG_TOML,
  "pyproject.toml": LABELS.LANG_TOML,
  "go.mod": LABELS.LANG_GO,
  "go.sum": LABELS.LANG_GO,
  "schema.prisma": LABELS.LANG_PRISMA
};
var CONFIG_FORMATS = new Set([
  "yaml",
  "toml",
  "json",
  "xml",
  "markdown",
  "csv",
  "ini",
  "env"
]);
// ../packages/shared/src/config.ts
var DEFAULT_CONFIG = {
  connection: {
    endpoint: "https://api.clauderag.io"
  },
  capture: {
    enabled: true,
    userPrompts: true,
    aiOutputs: true,
    toolCalls: true,
    toolResults: true,
    subAgents: true,
    multimodal: {
      copyFiles: true,
      maxFileSize: "50MB"
    },
    exclude: {
      tools: ["AskUserQuestion"],
      pathPatterns: ["*.env", "*.secret", "*credentials*"]
    }
  },
  rag: {
    mode: "auto",
    threshold: 0.6,
    maxContextTokens: 5000,
    perPrompt: {
      enabled: true,
      maxItems: 5,
      maxLatencyMs: 500
    },
    sessionStart: {
      enabled: true,
      maxItems: 3
    }
  },
  privacy: {
    redactSecrets: true,
    excludePatterns: [
      "password",
      "token",
      "secret",
      "api_key",
      "private_key"
    ]
  }
};
// src/config.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
function getConfigPath() {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || `${process.env.HOME}/.claude`;
  return `${claudeDir}/plugins/claude-rag/config.json`;
}
function loadConfig() {
  const path = getConfigPath();
  try {
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_CONFIG, parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && target[key] && typeof target[key] === "object") {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// src/api-client.ts
class RagApiClient {
  endpoint;
  apiKey;
  timeoutMs;
  constructor(opts) {
    this.endpoint = opts.endpoint.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 4000;
  }
  headers() {
    const h = { "Content-Type": "application/json" };
    if (this.apiKey)
      h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }
  async fetchWithTimeout(url, init) {
    const controller = new AbortController;
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }
  async ingest(events, project) {
    const body = { events, project };
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/ingest`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    if (!res.ok)
      throw new Error(`Ingest failed: ${res.status}`);
    return res.json();
  }
  async search(query, opts) {
    const body = {
      query,
      filters: opts?.filters,
      limit: opts?.limit,
      threshold: opts?.threshold,
      ...opts?.format && { format: opts.format }
    };
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    if (!res.ok)
      throw new Error(`Search failed: ${res.status}`);
    return res.json();
  }
  async health() {
    const res = await this.fetchWithTimeout(`${this.endpoint}/health`, {
      method: "GET",
      headers: this.headers()
    });
    return res.json();
  }
}

// src/hook-handler.ts
async function main() {
  const stdin = await readStdin();
  if (!stdin)
    process.exit(0);
  const config3 = loadConfig();
  if (!config3.capture.enabled)
    process.exit(0);
  if (!config3.connection.apiKey)
    process.exit(0);
  const client = new RagApiClient({
    endpoint: config3.connection.endpoint,
    apiKey: config3.connection.apiKey,
    timeoutMs: 4000
  });
  const projectName = detectProject(stdin.cwd);
  const hookEvent = stdin.hook_event_name;
  let txInfo = {};
  let turnId;
  try {
    if (stdin.transcript_path) {
      txInfo = await readTranscriptInfo(stdin.transcript_path);
      turnId = txInfo.promptId;
    }
  } catch {}
  try {
    switch (hookEvent) {
      case "UserPromptSubmit":
        await handleUserPrompt(stdin, client, config3, projectName, turnId);
        break;
      case "PostToolUse":
        await handleToolUse(stdin, client, config3, projectName, turnId);
        break;
      case "PostToolUseFailure":
        await handleToolFailure(stdin, client, config3, projectName, turnId);
        break;
      case "Stop":
        await handleStop(stdin, client, config3, projectName, turnId, txInfo);
        break;
      case "SubagentStop":
        await handleSubagentStop(stdin, client, config3, projectName, turnId);
        break;
      case "SessionStart":
        await handleSessionStart(stdin, client, config3, projectName);
        break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 50));
  process.exit(0);
}
async function handleUserPrompt(stdin, client, config3, project, turnId) {
  const isCommand = stdin.prompt.startsWith("/claude-rag:");
  if (config3.capture.userPrompts && !isCommand) {
    try {
      const { writeFileSync: writeFileSync2, mkdirSync: mkdirSync2 } = await import("fs");
      const tmpDir = "/tmp/claude-rag";
      mkdirSync2(tmpDir, { recursive: true });
      writeFileSync2(`${tmpDir}/pending-${stdin.session_id}.json`, JSON.stringify({
        event: buildEvent(stdin, "user_prompt", stdin.prompt),
        project
      }));
    } catch {}
  }
  if (!isCommand && (config3.rag.mode === "auto" || config3.rag.mode === "aggressive")) {
    if (config3.rag.perPrompt.enabled) {
      try {
        const result = await client.search(stdin.prompt, {
          limit: config3.rag.perPrompt.maxItems,
          threshold: config3.rag.threshold
        });
        if (result.results && result.results.length > 0) {
          const context = formatResultsForClaude(result.results, config3.rag.maxContextTokens);
          const summary = formatResultsSummary(result.results, result.latency_ms);
          process.stdout.write(JSON.stringify({
            additionalContext: context,
            systemMessage: summary
          }));
        }
      } catch {}
    }
  }
}
async function handleToolUse(stdin, client, config3, project, turnId) {
  if (config3.capture.exclude.tools.includes(stdin.tool_name))
    return;
  const events = [];
  if (config3.capture.toolCalls) {
    events.push(buildEvent(stdin, "tool_call", JSON.stringify(stdin.tool_input), {
      tool_name: stdin.tool_name,
      tool_input: stdin.tool_input,
      turnId
    }));
  }
  if (config3.capture.toolResults) {
    const content = typeof stdin.tool_response === "string" ? stdin.tool_response : JSON.stringify(stdin.tool_response);
    const filePath2 = stdin.tool_input?.file_path;
    const hasFile2 = isFileContent(stdin.tool_name, filePath2);
    events.push(buildEvent(stdin, "tool_result", content, {
      tool_name: stdin.tool_name,
      tool_input: stdin.tool_input,
      has_file: hasFile2,
      file_path: filePath2,
      turnId
    }));
  }
  if (events.length > 0) {
    await client.ingest(events, project);
  }
  if (hasFile && filePath && config3.capture.multimodal.copyFiles) {
    try {
      const { spawn } = await import("child_process");
      const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || "";
      let scriptPath = pluginRoot ? `${pluginRoot}/scripts/upload-file.sh` : "";
      if (!scriptPath) {
        const { dirname } = await import("path");
        const dir = dirname(new URL(import.meta.url).pathname);
        scriptPath = `${dir.replace("/src", "").replace("/dist", "")}/scripts/upload-file.sh`;
      }
      const { existsSync: existsSync2 } = await import("fs");
      if (!existsSync2(scriptPath)) {
        const { dirname } = await import("path");
        const thisFile = process.argv[1] || "";
        const altPath = `${dirname(thisFile).replace("/dist", "").replace("/src", "")}/scripts/upload-file.sh`;
        if (existsSync2(altPath)) {
          scriptPath = altPath;
        } else {
          process.stderr.write(`[claude-rag] Upload script not found: ${scriptPath} nor ${altPath}
`);
        }
      }
      if (existsSync2(scriptPath)) {
        const child = spawn("bash", [
          scriptPath,
          filePath,
          config3.connection.endpoint,
          config3.connection.apiKey || ""
        ], {
          detached: true,
          stdio: "ignore",
          env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` }
        });
        child.unref();
      }
    } catch (e) {
      process.stderr.write(`[claude-rag] Upload spawn error: ${e}
`);
    }
  }
}
async function handleToolFailure(stdin, client, config3, project, turnId) {
  if (!config3.capture.toolCalls)
    return;
  if (config3.capture.exclude.tools.includes(stdin.tool_name))
    return;
  await client.ingest([
    buildEvent(stdin, "error", `Tool ${stdin.tool_name} failed: ${stdin.error}`, {
      tool_name: stdin.tool_name,
      tool_input: stdin.tool_input,
      turnId
    })
  ], project);
}
async function handleStop(stdin, client, config3, project, turnId, txInfo) {
  if (!config3.capture.aiOutputs)
    return;
  if (!stdin.last_assistant_message)
    return;
  const tokenMeta = txInfo?.outputTokens ? {
    input_tokens: txInfo.inputTokens,
    output_tokens: txInfo.outputTokens,
    cache_read_tokens: txInfo.cacheReadTokens,
    model: txInfo.model
  } : undefined;
  const events = [];
  let ingestProject = project;
  try {
    const { readFileSync: readFileSync2, unlinkSync } = await import("fs");
    const pendingFile = `/tmp/claude-rag/pending-${stdin.session_id}.json`;
    const raw = readFileSync2(pendingFile, "utf-8");
    const pending = JSON.parse(raw);
    pending.event.turn_id = turnId;
    if (tokenMeta) {
      pending.event.metadata = { ...pending.event.metadata, tokens: tokenMeta };
    }
    events.push(pending.event);
    if (pending.project)
      ingestProject = pending.project;
    unlinkSync(pendingFile);
  } catch {}
  const aiEvent = buildEvent(stdin, "ai_output", stdin.last_assistant_message, { turnId });
  if (tokenMeta) {
    aiEvent.metadata = { ...aiEvent.metadata, tokens: tokenMeta };
  }
  events.push(aiEvent);
  await client.ingest(events, ingestProject);
}
async function handleSubagentStop(stdin, client, config3, project, turnId) {
  if (!config3.capture.subAgents)
    return;
  if (!stdin.last_assistant_message)
    return;
  await client.ingest([
    buildEvent(stdin, "ai_output", stdin.last_assistant_message, {
      is_sub_agent_override: true,
      turnId
    })
  ], project);
}
async function handleSessionStart(stdin, client, config3, project) {
  if (!config3.connection.apiKey)
    return;
  if (config3.rag.mode === "auto" || config3.rag.mode === "aggressive") {
    if (config3.rag.sessionStart.enabled) {
      try {
        const result = await client.search(`recent project context summary ${project}`, {
          limit: config3.rag.sessionStart.maxItems,
          threshold: config3.rag.threshold
        });
        if (result.results && result.results.length > 0) {
          const context = formatResultsForClaude(result.results, config3.rag.maxContextTokens);
          const summary = `\x1B]8;;https://clauderag.io\x07\x1B[35mClaude RAG\x1B[0m\x1B]8;;\x07 \u2014 loaded \x1B[33m${result.results.length}\x1B[0m context${result.results.length > 1 ? "s" : ""} from \x1B[36m"${project}"\x1B[0m`;
          process.stdout.write(JSON.stringify({
            additionalContext: context,
            systemMessage: summary
          }));
        }
      } catch {}
    }
  }
}
function buildEvent(stdin, contentType, content, extra) {
  const agentType = stdin.agent_type || "main";
  const isSubAgent = extra?.is_sub_agent_override ?? (agentType !== "main" && agentType !== undefined && !!stdin.agent_type);
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
    storage_key: extra?.storageKey,
    hook_event_name: stdin.hook_event_name,
    timestamp: new Date().toISOString(),
    turn_id: extra?.turnId
  };
}
async function readTranscriptInfo(transcriptPath) {
  const info = {};
  try {
    const { statSync, openSync, readSync, closeSync } = await import("fs");
    const stat = statSync(transcriptPath);
    if (stat.size === 0)
      return info;
    const TAIL_BYTES = 1e4;
    const fd = openSync(transcriptPath, "r");
    const start = Math.max(0, stat.size - TAIL_BYTES);
    const buf = Buffer.alloc(Math.min(TAIL_BYTES, stat.size));
    readSync(fd, buf, 0, buf.length, start);
    closeSync(fd);
    const tail = buf.toString("utf-8");
    const lines = tail.split(`
`).filter((l) => l.trim());
    if (start > 0)
      lines.shift();
    for (let i = lines.length - 1;i >= 0; i--) {
      try {
        const m = JSON.parse(lines[i]);
        if (!info.promptId && m.promptId && m.type === "user") {
          info.promptId = m.promptId;
        }
        if (!info.outputTokens && m.message?.usage) {
          const u = m.message.usage;
          info.inputTokens = u.input_tokens;
          info.outputTokens = u.output_tokens;
          info.cacheReadTokens = u.cache_read_input_tokens;
        }
        if (!info.model && m.message?.model) {
          info.model = m.message.model;
        }
        if (info.promptId && info.outputTokens)
          break;
      } catch {}
    }
  } catch {}
  return info;
}
function detectProject(cwd) {
  if (!cwd)
    return "unknown";
  const parts = cwd.split("/").filter(Boolean);
  return parts[parts.length - 1] || "unknown";
}
var FILE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "ico",
  "pdf",
  "mp3",
  "wav",
  "ogg",
  "flac",
  "mp4",
  "webm",
  "avi",
  "mov"
]);
function isFileContent(toolName, filePath2) {
  if (toolName !== "Read" || !filePath2)
    return false;
  const ext = filePath2.split(".").pop()?.toLowerCase();
  return ext ? FILE_EXTENSIONS.has(ext) : false;
}
async function readStdin() {
  if (process.stdin.isTTY)
    return null;
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw.trim())
    return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function formatResultsForClaude(results, maxTokens) {
  let output = `[RAG] Relevant context from past conversations:

`;
  let tokens = 15;
  for (const r of results) {
    const prefixMap = {
      user_prompt: "Prompt",
      ai_output: "AI Response",
      tool_call: `Tool call: ${r.tool_name || "unknown"}`,
      tool_result: `Result: ${r.tool_name || "unknown"}`,
      error: "Error"
    };
    const prefix = prefixMap[r.content_type] || r.content_type;
    const entry = `- [${prefix}] (score: ${r.score.toFixed(2)}, project: ${r.project_name})
  ${r.content.slice(0, 500)}
`;
    const entryTokens = Math.ceil(entry.length / 4);
    if (tokens + entryTokens > maxTokens)
      break;
    output += entry + `
`;
    tokens += entryTokens;
  }
  return output;
}
function formatResultsSummary(results, latencyMs) {
  const C = {
    reset: "\x1B[0m",
    yellow: "\x1B[33m",
    cyan: "\x1B[36m",
    purple: "\x1B[35m",
    dim: "\x1B[2m",
    white: "\x1B[37m",
    green: "\x1B[32m"
  };
  const icons = {
    user_prompt: "\uD83D\uDCAC",
    ai_output: "\uD83E\uDD16",
    tool_call: "\uD83D\uDCE4",
    tool_result: "\uD83D\uDD27",
    error: "\u274C"
  };
  const topResults = results.slice(0, 3);
  const lines = topResults.map((r) => {
    const score = Math.round(r.score * 100);
    const content = r.content || "";
    const hasQ = content.includes("Q: ");
    const hasA = content.includes(`

A: `);
    const hasTools = content.includes(`

Tools: `);
    if (hasQ && hasA) {
      const qMatch = content.match(/Q: (.+?)(?:\n|$)/);
      const q = qMatch ? qMatch[1].slice(0, 60) : "";
      let toolLine = "";
      if (hasTools) {
        const tMatch = content.match(/Tools: (.+?)(?:\n|$)/);
        if (tMatch)
          toolLine = `
     \uD83D\uDD27 ${C.cyan}${tMatch[1]}${C.reset}`;
      }
      const aPart = content.split(`

A: `)[1] || "";
      const tokenMatch = aPart.match(/\((\d+(?:\.\d+)?k?) tokens\)/);
      const tokenStr = tokenMatch ? tokenMatch[1] : "";
      const aText = aPart.replace(/\s*\(\d+(?:\.\d+)?k? tokens\)$/, "").replace(/\.\.\.$/, "").replace(/\n/g, " ").trim();
      const aPreview = aText.slice(0, 60);
      const tokenDisplay = tokenStr ? ` ${C.dim}(${tokenStr} tokens)${C.reset}` : "";
      return `  \uD83D\uDCAC ${C.yellow}${score}%${C.reset} \u2014 Q: ${C.white}${q}${C.reset}${toolLine}
     \uD83E\uDD16 A: ${C.green}${aPreview}${aText.length > 60 ? "..." : ""}${C.reset}${tokenDisplay}`;
    }
    const icon = icons[r.content_type] || "\uD83D\uDCC4";
    const tool = r.tool_name ? ` ${C.cyan}${r.tool_name}${C.reset}` : "";
    const sub = r.is_sub_agent ? ` ${C.dim}(sub-agent)${C.reset}` : "";
    const preview = content.replace(/\n/g, " ").slice(0, 80).trim();
    return `  ${icon} ${C.yellow}${score}%${C.reset}${tool}${sub} \u2014 ${preview}`;
  });
  const more = results.length > 3 ? `  ${C.dim}... +${results.length - 3} more${C.reset}` : "";
  const time = latencyMs ? ` ${C.dim}(${latencyMs}ms)${C.reset}` : "";
  return `\uD83D\uDD0D ${C.purple}RAG found ${results.length} match${results.length > 1 ? "es" : ""}${C.reset}${time}
${lines.join(`
`)}${more ? `
` + more : ""}`;
}
main();
