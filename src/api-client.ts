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

  async health(): Promise<{ status: string; db: boolean }> {
    const res = await this.fetchWithTimeout(`${this.endpoint}/health`, {
      method: "GET",
      headers: this.headers(),
    });
    return res.json();
  }
}
