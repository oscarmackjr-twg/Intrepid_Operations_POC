const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export const Api = {
  getRuns: () => api<any[]>("/runs"),
  getRunSummary: (runId: string) => api<any>(`/runs/${runId}/summary`),
  getExceptions: (runId: string) =>
    api<any[]>(`/runs/${runId}/exceptions`)
};
