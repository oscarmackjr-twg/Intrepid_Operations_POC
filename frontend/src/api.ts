// src/api.ts

// ---- Types ----

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

// Adjust this if your backend returns more / different fields
export interface RunException {
  rule_id: string;
  platform: string | null;
  severity: string;
  expected_value: string | null;
  actual_value: string | null;
  difference: string | number | null;
  balance_impact: number;
  created_at: string;
}

// ---- API base + helpers ----

// If VITE_API_BASE_URL is set, we'll use that.
// Otherwise we assume the frontend is served from the same origin as the API.
const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? "";

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): string {
  const url = new URL(path, API_BASE || window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("API error:", res.status, res.statusText, text);
    throw new Error(`API request failed with status ${res.status}`);
  }

  try {
    const data = (await res.json()) as T;
    return data;
  } catch (err) {
    console.error("Failed to parse JSON response:", err);
    throw new Error("Failed to parse JSON response from server");
  }
}

// ---- Public API ----

export const Api = {
  /**
   * Get paginated list of runs.
   * Backend can return either:
   *   { rows: RunListItem[]; total: number }
   * or just: RunListItem[]
   */
  async getRuns(
    page: number,
    pageSize: number
  ): Promise<{ rows: RunListItem[]; total?: number } | RunListItem[]> {
    const url = buildUrl("/api/runs", { page, pageSize });

    console.log("GET getRuns →", url);

    const res = await fetch(url, {
      method: "GET",
    });

    const data = await handleJsonResponse<
      { rows: RunListItem[]; total?: number } | RunListItem[]
    >(res);

    console.log("getRuns data:", data);
    return data;
  },

  /**
   * Get summary info for a specific run.
   * BACKEND: GET /api/summary/:runId (from summary.ts)
   */
  async getRunSummary(runId: string): Promise<RunSummary> {
    const url = buildUrl(`/api/summary/${encodeURIComponent(runId)}`);

    console.log("GET getRunSummary →", url);

    const res = await fetch(url, {
      method: "GET",
    });

    const data = await handleJsonResponse<RunSummary>(res);
    console.log("getRunSummary data:", data);

    return data;
  },

  /**
   * Get exceptions for a specific run.
   * BACKEND (likely): GET /api/portfolio-exceptions/:runId
   * If your portfolioExceptions.ts uses a slightly different path,
   * just change the string below to match it exactly.
   */
   async getExceptions(runId: string): Promise<RunException[]> {
     const url = buildUrl(
       `/api/portfolio-exceptions/${encodeURIComponent(runId)}`
     );

     console.log("GET getExceptions →", url);

     const res = await fetch(url, {
       method: "GET",
     });

     // Backend returns plain array: res.json(result.rows);
     const data = await handleJsonResponse<RunException[]>(res);

     console.log("getExceptions data:", data);

     return data;
   },
};
