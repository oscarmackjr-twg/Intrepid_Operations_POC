// src/pages/RunListPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Api } from "../api";
import type { RunListItem } from "../api";

export const RunListPage: React.FC = () => {
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await Api.getRuns(page, pageSize);

        console.log("RunListPage got result:", result);

        // Be defensive: support plain array result as well
        const rows = (result as any).rows ?? (result as any);
        const list = Array.isArray(rows) ? (rows as RunListItem[]) : [];

        setRuns(list);
        setTotal(
          typeof (result as any).total === "number"
            ? (result as any).total
            : list.length
        );
      } catch (err: any) {
        console.error("Failed to fetch runs", err);
        setError(err?.message ?? "Failed to fetch runs");
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ padding: "20px" }}>
      <h1>Loan Engine Runs</h1>

      {loading && <p>Loading runs…</p>}
      {error && (
        <p style={{ color: "red" }}>
          Error loading runs: {error}
        </p>
      )}

      {!loading && !error && runs.length === 0 && (
        <div>
          <p>No runs found.</p>
          <p style={{ fontSize: "0.85rem", color: "#555" }}>
            If you just ran the pipeline, try refreshing the page.  
            Also check the browser console for the `Api.getRuns response:` log.
          </p>
        </div>
      )}

      {!loading && !error && runs.length > 0 && (
        <>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  Run ID
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  As Of Date
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  Portfolio
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  IRR Target
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  Status
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "4px" }}>
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.run_id}>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    <Link to={`/runs/${encodeURIComponent(run.run_id)}`}>
                      {run.run_id}
                    </Link>
                  </td>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    {run.as_of_date}
                  </td>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    {run.portfolio ?? "—"}
                  </td>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    {run.irr_target ?? "—"}
                  </td>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    {run.status ?? "—"}
                  </td>
                  <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>
                    {run.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
