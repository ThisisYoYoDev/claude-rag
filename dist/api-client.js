export class RagApiClient {
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
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const res = await fetch(url, { ...init, signal: controller.signal });
            return res;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async ingest(events, project) {
        const body = { events, project };
        const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/ingest`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(body),
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
            ...(opts?.format && { format: opts.format }),
        };
        const res = await this.fetchWithTimeout(`${this.endpoint}/api/v1/search`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Search failed: ${res.status}`);
        return res.json();
    }
    async health() {
        const res = await this.fetchWithTimeout(`${this.endpoint}/health`, {
            method: "GET",
            headers: this.headers(),
        });
        return res.json();
    }
}
//# sourceMappingURL=api-client.js.map