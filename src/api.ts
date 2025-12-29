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
  // started_at / completed_at are returned by /api/runs but not required by the UI
  started_at?: string | null;
  completed_at?: string | null;
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
    console.log("Api.getRuns response:", data); // 🔍 debug in browser console

    // If backend returns plain array: [ { run_id, ... }, ... ]
    if (Array.isArray(data)) {
      return {
        rows: data as RunListItem[],
        total: data.length,
      };
    }

    // If backend returns { rows: [...], total: X }
    if (data && Array.isArray((data as any).rows)) {
      const rows = (data as any).rows as RunListItem[];
      const totalRaw = (data as any).total;
      const total =
        typeof totalRaw === "number"
          ? totalRaw
          : Number(totalRaw ?? rows.length) || rows.length;

      return { rows, total };
    }

    // Fallback to help debug any surprising shape
    console.error("Unexpected /api/runs response format", data);
    throw new Error("Unexpected response format from /api/runs");
  },

  async getRunSummary(runId: string): Promise<RunSummary> {
    const r = await fetch(`${BASE_URL}/summary/${encodeURIComponent(runId)}`);
    if (!r.ok) throw new Error("Failed to fetch run summary");
    return r.json();
  },

  async getExceptions(params: {
    runId: string;
    page?: number;
    pageSize?: number;
    sellerLoanNo?: string;
    ruleId?: string;
    severity?: string;
  }): Promise<any> {
    const query = new URLSearchParams();

    query.set("runId", params.runId);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.pageSize !== undefined)
      query.set("pageSize", String(params.pageSize));
    if (params.sellerLoanNo)
      query.set("sellerLoanNo", params.sellerLoanNo);
    if (params.ruleId) query.set("ruleId", params.ruleId);
    if (params.severity) query.set("severity", params.severity);

    const r = await fetch(`${BASE_URL}/exceptions?${query.toString()}`);
    if (!r.ok) throw new Error("Failed to fetch exceptions");
    return r.json();
  },
};
