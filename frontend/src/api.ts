// src/api.ts

export interface RunSummary {
  runId: string;
  totalLoans: number;
  loansWithExceptions: number;
  balanceImpact: number;
}

export interface RunListItem {
  run_id: string;
  as_of_date: string;
  portfolio: string | null;
  irr_target: number | null;
  status: string | null;
  created_at: string;
}

const BASE_URL = "http://localhost:3001/api";

export const Api = {
  async getRuns(
    page = 0,
    pageSize = 25
  ): Promise<{ rows: RunListItem[]; total: number }> {
    const r = await fetch(`${BASE_URL}/runs?page=${page}&pageSize=${pageSize}`);
    if (!r.ok) throw new Error("Failed to fetch runs");

    const data = await r.json();

    // Case 1: backend returns a plain array: [ { ...run }, ... ]
    if (Array.isArray(data)) {
      return {
        rows: data as RunListItem[],
        total: data.length,
      };
    }

    // Case 2: backend returns { rows: [...], total: N }
    if (Array.isArray((data as any).rows)) {
      const rows = (data as any).rows as RunListItem[];
      const total =
        typeof (data as any).total === "number"
          ? (data as any).total
          : rows.length;

      return { rows, total };
    }

    // Fallback – helps you see if the shape is something else
    console.error("Unexpected /api/runs response", data);
    throw new Error("Unexpected response format from /api/runs");
  },

  async getRunSummary(runId: string): Promise<RunSummary> {
    const r = await fetch(`${BASE_URL}/summary/${encodeURIComponent(runId)}`);
    if (!r.ok) throw new Error("Failed to fetch run summary");
    return r.json();
  },

  async getExceptions(params: {
    runId: string;
    platform?: string;
    exceptionType?: string;
    severity?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: any[]; total: number }> {
    const query = new URLSearchParams();

    query.set("runId", params.runId);
    if (params.platform) query.set("platform", params.platform);
    if (params.exceptionType) query.set("exceptionType", params.exceptionType);
    if (params.severity) query.set("severity", params.severity);

    if (params.page !== undefined)
      query.set("page", String(params.page));
    if (params.pageSize !== undefined)
      query.set("pageSize", String(params.pageSize));

    const url = `${BASE_URL}/exceptions?${query.toString()}`;
    console.log("getExceptions →", url); // 👀 see exact URL

    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("getExceptions error response:", r.status, text);
      throw new Error(`Failed to fetch exceptions (status ${r.status})`);
    }

    const data = await r.json();
    console.log("getExceptions data:", data);
    return data;
  },
};
