import type {
  IngestRequest,
  IngestResponse,
  SearchRequest,
  SearchResponse,
  StatsResponse,
  RawEvent,
} from "@claude-rag/shared";

export class RagApiClient {
  private endpoint: string;
  private apiKey?: string;
  private timeoutMs: number;

  constructor(opts: { endpoint: string; apiKey?: string; timeoutMs?: number }) {
    this.endpoint = opts.endpoint.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 4000;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["Authorization"] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  async ingest(events: RawEvent[], project: string): Promise<IngestResponse> {
    const body: IngestRequest = { events, project };
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/ingest`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ingest failed: ${res.status}`);
    return res.json() as Promise<IngestResponse>;
  }

  async search(
    query: string,
    opts?: {
      filters?: SearchRequest["filters"];
      limit?: number;
      threshold?: number;
      format?: "full" | "claude";
    }
  ): Promise<SearchResponse & { context?: string }> {
    const body: SearchRequest & { format?: string } = {
      query,
      filters: opts?.filters,
      limit: opts?.limit,
      threshold: opts?.threshold,
      ...(opts?.format && { format: opts.format }),
    };
    const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  }

  async getEvents(ids: string[]): Promise<{ events: any[] }> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/events?ids=${ids.join(",")}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`);
    return res.json();
  }

  async getEvent(id: string): Promise<{ event: any }> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/events/${id}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Event fetch failed: ${res.status}`);
    return res.json();
  }

  async getTurn(turnId: string): Promise<{ turn: any }> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/turns/${turnId}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Turn fetch failed: ${res.status}`);
    return res.json();
  }

  async getTimeline(sessionId: string, opts?: {
    limit?: number;
    cursor?: string;
    direction?: "asc" | "desc";
  }): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.cursor) params.set("cursor", opts.cursor);
    if (opts?.direction) params.set("direction", opts.direction);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/sessions/${sessionId}/timeline${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
    return res.json();
  }

  async getSessionSummary(sessionId: string): Promise<any> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/sessions/${sessionId}/summary`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Session summary fetch failed: ${res.status}`);
    return res.json();
  }

  async generateSessionSummary(sessionId: string): Promise<any> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/sessions/${sessionId}/summary`,
      { method: "POST", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Session summary generation failed: ${res.status}`);
    return res.json();
  }

  async getContinuation(): Promise<any> {
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/sessions/latest/continuation`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Continuation fetch failed: ${res.status}`);
    return res.json();
  }

  async getProductivity(period?: string, projectId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    if (projectId) params.set("project_id", projectId);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/analytics/productivity${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Productivity fetch failed: ${res.status}`);
    return res.json();
  }

  async getMistakes(opts?: { project_id?: string; limit?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.project_id) params.set("project_id", opts.project_id);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/analytics/mistakes${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Mistakes fetch failed: ${res.status}`);
    return res.json();
  }

  async getDebt(opts?: { project_id?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.project_id) params.set("project_id", opts.project_id);
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/analytics/debt${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Debt fetch failed: ${res.status}`);
    return res.json();
  }

  async getEntities(opts?: { type?: string; name?: string; project_id?: string; limit?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.type) params.set("type", opts.type);
    if (opts?.name) params.set("name", opts.name);
    if (opts?.project_id) params.set("project_id", opts.project_id);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/analytics/entities${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Entities fetch failed: ${res.status}`);
    return res.json();
  }

  async getDecisions(opts?: { project_id?: string; limit?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.project_id) params.set("project_id", opts.project_id);
    if (opts?.limit) params.set("limit", String(opts.limit));
    const qs = params.toString();
    const res = await this.fetchWithTimeout(
      `${this.endpoint}/api/v1/analytics/decisions${qs ? "?" + qs : ""}`,
      { method: "GET", headers: this.headers() }
    );
    if (!res.ok) throw new Error(`Decisions fetch failed: ${res.status}`);
    return res.json();
  }

  async health(): Promise<{ status: string; db: boolean; latest_plugin_version?: string }> {
    const res = await this.fetchWithTimeout(`${this.endpoint}/health`, {
      method: "GET",
      headers: this.headers(),
    });
    return res.json();
  }
}
