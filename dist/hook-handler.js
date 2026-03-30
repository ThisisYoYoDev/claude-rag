#!/usr/bin/env node
import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);
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
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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
      ...opts?.format && { format: opts.format },
      ...opts?.excludeEchoQuery && { exclude_echo_query: opts.excludeEchoQuery }
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
  async getEvents(ids) {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/events?ids=${ids.join(",")}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Events fetch failed: ${res.status}`);
    return res.json();
  }
  async getEvent(id) {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/events/${id}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Event fetch failed: ${res.status}`);
    return res.json();
  }
  async getTurn(turnId) {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/turns/${turnId}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Turn fetch failed: ${res.status}`);
    return res.json();
  }
  async getTimeline(sessionId, opts) {
    const params = new URLSearchParams;
    if (opts?.limit)
      params.set("limit", String(opts.limit));
    if (opts?.cursor)
      params.set("cursor", opts.cursor);
    if (opts?.direction)
      params.set("direction", opts.direction);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/sessions/${sessionId}/timeline${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Timeline fetch failed: ${res.status}`);
    return res.json();
  }
  async getSessionSummary(sessionId) {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/sessions/${sessionId}/summary`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Session summary fetch failed: ${res.status}`);
    return res.json();
  }
  async generateSessionSummary(sessionId) {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/sessions/${sessionId}/summary`, { method: "POST", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Session summary generation failed: ${res.status}`);
    return res.json();
  }
  async getContinuation() {
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/sessions/latest/continuation`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Continuation fetch failed: ${res.status}`);
    return res.json();
  }
  async getProductivity(period, projectId) {
    const params = new URLSearchParams;
    if (period)
      params.set("period", period);
    if (projectId)
      params.set("project_id", projectId);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/analytics/productivity${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Productivity fetch failed: ${res.status}`);
    return res.json();
  }
  async getMistakes(opts) {
    const params = new URLSearchParams;
    if (opts?.project_id)
      params.set("project_id", opts.project_id);
    if (opts?.limit)
      params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/analytics/mistakes${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Mistakes fetch failed: ${res.status}`);
    return res.json();
  }
  async getDebt(opts) {
    const params = new URLSearchParams;
    if (opts?.project_id)
      params.set("project_id", opts.project_id);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/analytics/debt${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Debt fetch failed: ${res.status}`);
    return res.json();
  }
  async getEntities(opts) {
    const params = new URLSearchParams;
    if (opts?.type)
      params.set("type", opts.type);
    if (opts?.name)
      params.set("name", opts.name);
    if (opts?.project_id)
      params.set("project_id", opts.project_id);
    if (opts?.limit)
      params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/analytics/entities${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Entities fetch failed: ${res.status}`);
    return res.json();
  }
  async getDecisions(opts) {
    const params = new URLSearchParams;
    if (opts?.project_id)
      params.set("project_id", opts.project_id);
    if (opts?.limit)
      params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/analytics/decisions${qs ? "?" + qs : ""}`, { method: "GET", headers: this.headers() });
    if (!res.ok)
      throw new Error(`Decisions fetch failed: ${res.status}`);
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
// package.json
var package_default = {
  name: "@claude-rag/plugin",
  version: "0.3.3",
  type: "module",
  main: "dist/hook-handler.js",
  scripts: {
    build: 'PATH="$HOME/.bun/bin:$PATH" bun build src/hook-handler.ts --outdir dist --target bun --bundle && PATH="$HOME/.bun/bin:$PATH" bun build src/mcp-server.ts --outdir dist --target bun --bundle',
    dev: 'PATH="$HOME/.bun/bin:$PATH" bun build src/hook-handler.ts --outdir dist --target bun --bundle --watch',
    typecheck: "tsc --noEmit"
  },
  dependencies: {
    "@claude-rag/shared": "workspace:*",
    zod: "^4.3.6"
  },
  devDependencies: {
    "@modelcontextprotocol/sdk": "^1.28.0",
    "bun-types": "latest",
    typescript: "^5.8.0"
  }
};

// src/hook-handler.ts
var PLUGIN_VERSION = package_default.version;
async function main() {
  const stdin = await readStdin();
  if (!stdin)
    process.exit(0);
  const config2 = loadConfig();
  if (!config2.capture.enabled)
    process.exit(0);
  if (!config2.connection.apiKey)
    process.exit(0);
  const client = new RagApiClient({
    endpoint: config2.connection.endpoint,
    apiKey: config2.connection.apiKey,
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
        await handleUserPrompt(stdin, client, config2, projectName, turnId);
        break;
      case "PostToolUse":
        await handleToolUse(stdin, client, config2, projectName, turnId);
        break;
      case "PostToolUseFailure":
        await handleToolFailure(stdin, client, config2, projectName, turnId);
        break;
      case "Stop":
        await handleStop(stdin, client, config2, projectName, turnId, txInfo);
        break;
      case "SubagentStop":
        await handleSubagentStop(stdin, client, config2, projectName, turnId);
        break;
      case "SessionStart":
        await handleSessionStart(stdin, client, config2, projectName);
        break;
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 50));
  process.exit(0);
}
async function handleUserPrompt(stdin, client, config2, project, turnId) {
  const isCommand = stdin.prompt.startsWith("/claude-rag:");
  if (config2.capture.userPrompts && !isCommand) {
    const strippedPrompt = stripPrivateTags(stdin.prompt);
    if (strippedPrompt) {
      try {
        const { writeFileSync: writeFileSync2, mkdirSync: mkdirSync2 } = await import("node:fs");
        const tmpDir = "/tmp/claude-rag";
        mkdirSync2(tmpDir, { recursive: true });
        writeFileSync2(`${tmpDir}/pending-${stdin.session_id}.json`, JSON.stringify({
          event: buildEvent(stdin, "user_prompt", strippedPrompt),
          project
        }));
      } catch {}
    }
  }
  const injState = readInjectionState(stdin.session_id);
  injState.turnCount++;
  if (injState.turnCount === 1 && injState.injectedEventIds.length > 0) {
    writeInjectionState(stdin.session_id, injState);
    return;
  }
  if (injState.turnCount % REFRESH_INTERVAL === 0) {
    injState.injectedEventIds = [];
  }
  let compactionContext = "";
  if (!isCommand && stdin.transcript_path) {
    const compacted = await detectCompaction(stdin.transcript_path, stdin.session_id);
    if (compacted) {
      injState.injectedEventIds = [];
      try {
        const recoveryResult = await client.search("instructions decisions rules conventions preferences architecture", {
          limit: 5,
          threshold: 0.3
        });
        if (recoveryResult.results?.length > 0) {
          compactionContext = `[COMPACTION RECOVERY] Context was compacted. Re-injecting critical decisions and instructions from earlier in this session:

`;
          for (const r of recoveryResult.results) {
            compactionContext += `- ${r.content.slice(0, 500)}

`;
          }
        }
      } catch {}
    }
  }
  if (!isCommand && (config2.rag.mode === "auto" || config2.rag.mode === "aggressive")) {
    if (config2.rag.perPrompt.enabled) {
      try {
        const result = await client.search(stdin.prompt, {
          limit: config2.rag.perPrompt.maxItems,
          threshold: config2.rag.threshold,
          filters: { exclude_session_id: stdin.session_id },
          excludeEchoQuery: stdin.prompt
        });
        if (result.results && result.results.length > 0) {
          const knownIds = new Set(injState.injectedEventIds);
          const newResults = result.results.filter((r) => !knownIds.has(r.event_id));
          const cachedCount = result.results.length - newResults.length;
          if (newResults.length > 0) {
            const context = formatResultsForClaude(newResults, config2.rag.maxContextTokens);
            const summary = formatResultsSummary(newResults, result.latency_ms, cachedCount);
            process.stdout.write(JSON.stringify({
              additionalContext: compactionContext + context,
              systemMessage: summary
            }));
            injState.injectedEventIds.push(...newResults.map((r) => r.event_id));
          } else if (cachedCount > 0) {
            const C = { dim: "\x1B[2m", reset: "\x1B[0m", yellow: "\x1B[33m" };
            const time = result.latency_ms ? ` ${C.dim}(${result.latency_ms}ms)${C.reset}` : "";
            process.stdout.write(JSON.stringify({
              systemMessage: `\uD83D\uDD0D ${C.dim}RAG: ${cachedCount} cached${time} — 0 tokens injected${C.reset}`,
              ...compactionContext ? { additionalContext: compactionContext } : {}
            }));
          }
          writeInjectionState(stdin.session_id, injState);
          return;
        }
      } catch {}
    }
  }
  writeInjectionState(stdin.session_id, injState);
  if (compactionContext) {
    process.stdout.write(JSON.stringify({
      additionalContext: compactionContext
    }));
  }
}
async function handleToolUse(stdin, client, config2, project, turnId) {
  if (config2.capture.exclude.tools.includes(stdin.tool_name))
    return;
  const events = [];
  const filePath = stdin.tool_input?.file_path;
  const hasFile = isFileContent(stdin.tool_name, filePath);
  if (config2.capture.toolCalls) {
    const toolCallEvent = buildEvent(stdin, "tool_call", JSON.stringify(stdin.tool_input), {
      tool_name: stdin.tool_name,
      tool_input: stdin.tool_input,
      turnId
    });
    if (toolCallEvent.content) {
      events.push(toolCallEvent);
    }
  }
  if (config2.capture.toolResults) {
    const content = typeof stdin.tool_response === "string" ? stdin.tool_response : JSON.stringify(stdin.tool_response);
    const toolResultEvent = buildEvent(stdin, "tool_result", content, {
      tool_name: stdin.tool_name,
      tool_input: stdin.tool_input,
      has_file: hasFile,
      file_path: filePath,
      turnId
    });
    if (toolResultEvent.content) {
      events.push(toolResultEvent);
    }
  }
  if (events.length > 0) {
    await client.ingest(events, project);
  }
  if (hasFile && filePath && config2.capture.multimodal.copyFiles) {
    try {
      const { spawn } = await import("node:child_process");
      const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || "";
      let scriptPath = pluginRoot ? `${pluginRoot}/scripts/upload-file.sh` : "";
      if (!scriptPath) {
        const { dirname } = await import("node:path");
        const dir = dirname(new URL(import.meta.url).pathname);
        scriptPath = `${dir.replace("/src", "").replace("/dist", "")}/scripts/upload-file.sh`;
      }
      const { existsSync: existsSync2 } = await import("node:fs");
      if (!existsSync2(scriptPath)) {
        const { dirname } = await import("node:path");
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
          config2.connection.endpoint,
          config2.connection.apiKey || ""
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
async function handleToolFailure(stdin, client, config2, project, turnId) {
  if (!config2.capture.toolCalls)
    return;
  if (config2.capture.exclude.tools.includes(stdin.tool_name))
    return;
  const errorEvent = buildEvent(stdin, "error", `Tool ${stdin.tool_name} failed: ${stdin.error}`, {
    tool_name: stdin.tool_name,
    tool_input: stdin.tool_input,
    turnId
  });
  if (!errorEvent.content)
    return;
  await client.ingest([errorEvent], project);
}
async function handleStop(stdin, client, config2, project, turnId, txInfo) {
  if (!config2.capture.aiOutputs)
    return;
  if (!stdin.last_assistant_message)
    return;
  const tokenMeta = txInfo?.outputTokens ? {
    input_tokens: txInfo.inputTokens,
    output_tokens: txInfo.outputTokens,
    cache_read_tokens: txInfo.cacheReadTokens,
    model: txInfo.model,
    session_total_input: txInfo.sessionTotalInput,
    session_total_output: txInfo.sessionTotalOutput
  } : undefined;
  const events = [];
  let ingestProject = project;
  try {
    const { readFileSync: readFileSync2, unlinkSync } = await import("node:fs");
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
  if (aiEvent.content) {
    if (tokenMeta) {
      aiEvent.metadata = { ...aiEvent.metadata, tokens: tokenMeta };
    }
    events.push(aiEvent);
  }
  if (events.length > 0) {
    await client.ingest(events, ingestProject);
  }
}
async function handleSubagentStop(stdin, client, config2, project, turnId) {
  if (!config2.capture.subAgents)
    return;
  if (!stdin.last_assistant_message)
    return;
  const subagentEvent = buildEvent(stdin, "ai_output", stdin.last_assistant_message, {
    is_sub_agent_override: true,
    turnId
  });
  if (!subagentEvent.content)
    return;
  await client.ingest([subagentEvent], project);
}
async function handleSessionStart(stdin, client, config2, project) {
  if (!config2.connection.apiKey)
    return;
  const C = {
    reset: "\x1B[0m",
    yellow: "\x1B[33m",
    cyan: "\x1B[36m",
    purple: "\x1B[35m",
    dim: "\x1B[2m",
    green: "\x1B[32m",
    red: "\x1B[31m"
  };
  const ghApi = "https://api.github.com/repos/ThisisYoYoDev/claude-plugins/contents/.claude-plugin/marketplace.json";
  const ghRaw = "https://raw.githubusercontent.com/ThisisYoYoDev/claude-plugins/main/.claude-plugin/marketplace.json";
  const [marketplaceResult, searchResult, continuationResult] = await Promise.allSettled([
    fetch(ghApi, {
      headers: { Accept: "application/vnd.github.raw+json" },
      signal: AbortSignal.timeout(3000)
    }).then((r) => r.ok ? r.json() : fetch(ghRaw, { signal: AbortSignal.timeout(3000) }).then((r2) => r2.ok ? r2.json() : null)).catch(() => null),
    config2.rag.sessionStart.enabled && (config2.rag.mode === "auto" || config2.rag.mode === "aggressive") ? client.search(`recent project context summary ${project}`, {
      limit: config2.rag.sessionStart.maxItems,
      threshold: config2.rag.threshold
    }) : Promise.resolve(null),
    client.getContinuation().catch(() => null)
  ]);
  const marketplace = marketplaceResult.status === "fulfilled" ? marketplaceResult.value : null;
  const search = searchResult.status === "fulfilled" ? searchResult.value : null;
  const continuation = continuationResult.status === "fulfilled" ? continuationResult.value : null;
  const latestVersion = marketplace?.plugins?.find((p) => p.name === "claude-rag")?.version;
  const lines = [];
  let versionLine = `\x1B]8;;https://clauderag.io\x07${C.purple}Claude RAG${C.reset}\x1B]8;;\x07 ${C.dim}v${PLUGIN_VERSION}${C.reset}`;
  let additionalContext = "";
  const cont = continuation?.continuation;
  if (cont?.text) {
    additionalContext += `[Continuation] ${cont.text}

`;
    versionLine += ` — ${C.dim}resumed${C.reset}`;
  }
  if (search && search.results && search.results.length > 0) {
    additionalContext += formatResultsForClaude(search.results, config2.rag.maxContextTokens);
    versionLine += `${cont?.text ? " +" : " —"} ${C.yellow}${search.results.length}${C.reset} context${search.results.length > 1 ? "s" : ""} from ${C.cyan}"${project}"${C.reset}`;
  }
  if (!additionalContext.trim())
    additionalContext = "";
  if (latestVersion && isNewerVersion(latestVersion, PLUGIN_VERSION)) {
    versionLine += `
  ${C.yellow}Update available: v${latestVersion}${C.reset} — run: ${C.cyan}claude plugin update claude-rag@yoyodev${C.reset}`;
  }
  lines.push(versionLine);
  const output = {
    systemMessage: lines.join(`
`)
  };
  if (additionalContext)
    output.additionalContext = additionalContext;
  if (search && search.results && search.results.length > 0) {
    writeInjectionState(stdin.session_id, {
      injectedEventIds: search.results.map((r) => r.event_id),
      turnCount: 0
    });
  }
  process.stdout.write(JSON.stringify(output));
}
function stripPrivateTags(content) {
  const stripped = content.replace(/<private>[\s\S]*?<\/private>/gi, "");
  return stripped.replace(/\n{3,}/g, `

`).trim();
}
function isNewerVersion(latest, current) {
  const a = latest.split(".").map(Number);
  const b = current.split(".").map(Number);
  for (let i = 0;i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0))
      return true;
    if ((a[i] || 0) < (b[i] || 0))
      return false;
  }
  return false;
}
function buildEvent(stdin, contentType, content, extra) {
  const strippedContent = stripPrivateTags(content);
  const agentType = stdin.agent_type || "main";
  const isSubAgent = extra?.is_sub_agent_override ?? (agentType !== "main" && agentType !== undefined && !!stdin.agent_type);
  return {
    session_id: stdin.session_id,
    agent_id: stdin.agent_id || "main",
    content_type: contentType,
    content: strippedContent,
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
    const { readFileSync: readFileSync2 } = await import("node:fs");
    const content = readFileSync2(transcriptPath, "utf-8");
    if (!content)
      return info;
    const lines = content.split(`
`).filter((l) => l.trim());
    let totalInput = 0;
    let totalOutput = 0;
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
      } catch {}
    }
    for (const line of lines) {
      try {
        const m = JSON.parse(line);
        if (m.message?.usage) {
          totalInput += m.message.usage.input_tokens || 0;
          totalOutput += m.message.usage.output_tokens || 0;
        }
      } catch {}
    }
    if (totalOutput > 0) {
      info.sessionTotalInput = totalInput;
      info.sessionTotalOutput = totalOutput;
    }
  } catch {}
  return info;
}
async function detectCompaction(transcriptPath, sessionId) {
  try {
    const { readFileSync: readFileSync2, existsSync: existsSync2, writeFileSync: writeFileSync2, mkdirSync: mkdirSync2 } = await import("node:fs");
    const content = readFileSync2(transcriptPath, "utf-8");
    const lines = content.split(`
`).filter((l) => l.trim());
    let summaryCount = 0;
    for (const line of lines) {
      try {
        const m = JSON.parse(line);
        if (m.type === "summary")
          summaryCount++;
      } catch {}
    }
    const stateFile = `/tmp/claude-rag/compaction-${sessionId}.json`;
    let lastCount = 0;
    if (existsSync2(stateFile)) {
      try {
        lastCount = JSON.parse(readFileSync2(stateFile, "utf-8")).summaryCount || 0;
      } catch {}
    }
    mkdirSync2("/tmp/claude-rag", { recursive: true });
    writeFileSync2(stateFile, JSON.stringify({ summaryCount }));
    return summaryCount > lastCount;
  } catch {
    return false;
  }
}
var REFRESH_INTERVAL = 10;
function readInjectionState(sessionId) {
  try {
    const { readFileSync: readFileSync2 } = __require("node:fs");
    const raw = readFileSync2(`/tmp/claude-rag/injection-${sessionId}.json`, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { injectedEventIds: [], turnCount: 0 };
  }
}
function writeInjectionState(sessionId, state) {
  try {
    const { writeFileSync: writeFileSync2, mkdirSync: mkdirSync2 } = __require("node:fs");
    mkdirSync2("/tmp/claude-rag", { recursive: true });
    writeFileSync2(`/tmp/claude-rag/injection-${sessionId}.json`, JSON.stringify(state));
  } catch {}
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
function isFileContent(toolName, filePath) {
  if (toolName !== "Read" || !filePath)
    return false;
  const ext = filePath.split(".").pop()?.toLowerCase();
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
function formatResultsSummary(results, latencyMs, cachedCount) {
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
    error: "❌"
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
      return `  \uD83D\uDCAC ${C.yellow}${score}%${C.reset} — Q: ${C.white}${q}${C.reset}${toolLine}
     \uD83E\uDD16 A: ${C.green}${aPreview}${aText.length > 60 ? "..." : ""}${C.reset}${tokenDisplay}`;
    }
    const icon = icons[r.content_type] || "\uD83D\uDCC4";
    const tool = r.tool_name ? ` ${C.cyan}${r.tool_name}${C.reset}` : "";
    const sub = r.is_sub_agent ? ` ${C.dim}(sub-agent)${C.reset}` : "";
    const preview = content.replace(/\n/g, " ").slice(0, 80).trim();
    return `  ${icon} ${C.yellow}${score}%${C.reset}${tool}${sub} — ${preview}`;
  });
  const more = results.length > 3 ? `  ${C.dim}... +${results.length - 3} more${C.reset}` : "";
  const time = latencyMs ? ` ${C.dim}(${latencyMs}ms)${C.reset}` : "";
  const cached = cachedCount ? ` ${C.dim}+ ${cachedCount} cached${C.reset}` : "";
  return `\uD83D\uDD0D ${C.purple}RAG: ${results.length} new${cached}${C.reset}${time}
${lines.join(`
`)}${more ? `
` + more : ""}`;
}
main();
