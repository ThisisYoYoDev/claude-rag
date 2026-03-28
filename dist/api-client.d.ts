import type { IngestResponse, SearchRequest, SearchResponse, RawEvent } from "@claude-rag/shared";
export declare class RagApiClient {
    private endpoint;
    private apiKey?;
    private timeoutMs;
    constructor(opts: {
        endpoint: string;
        apiKey?: string;
        timeoutMs?: number;
    });
    private headers;
    private fetchWithTimeout;
    ingest(events: RawEvent[], project: string): Promise<IngestResponse>;
    search(query: string, opts?: {
        filters?: SearchRequest["filters"];
        limit?: number;
        threshold?: number;
        format?: "full" | "claude";
    }): Promise<SearchResponse & {
        context?: string;
    }>;
    health(): Promise<{
        status: string;
        db: boolean;
    }>;
}
//# sourceMappingURL=api-client.d.ts.map