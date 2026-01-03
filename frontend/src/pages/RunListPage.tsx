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

        console.log("✔ Api.getRuns() returned:", result);

        // Defensive parsing
        const rows = (result as any).rows ?? (result as any);
        const list = Array.isArray(rows) ? (rows as RunListItem[]) : [];

        setRuns(list);

        setTotal(
          typeof (result as any).total === "number"
            ? (result as any).total
            : list.length
        );
      } catch (err: any) {
        console.error("✖ Failed to fetch runs", err);
        setError(err?.message ?? "Failed to fetch runs");
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Loan Engine Runs</h1>

      {/* Loading */}
      {loading && (
        <div className="text-slate-300">
          Loading runs…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-400">
          Error loading runs: {error}
        </div>
      )}

      {/* No data */}
      {!loading && !error && runs.length === 0 && (
        <div className="text-slate-400">
          <p>No runs found.</p>
          <p className="text-sm">
            If you just ran the pipeline, refresh the page.
            Check the browser console for <code>Api.getRuns()</code> output.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && runs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800/40">
              <tr className="text-left">
                <th className="px-3 py-2 border-b border-slate-700">Run ID</th>
                <th className="px-3 py-2 border-b border-slate-700">As Of Date</th>
                <th className="px-3 py-2 border-b border-slate-700">Portfolio</th>
                <th className="px-3 py-2 border-b border-slate-700">IRR Target</th>
                <th className="px-3 py-2 border-b border-slate-700">Status</th>
                <th className="px-3 py-2 border-b border-slate-700">Created At</th>
              </tr>
            </thead>

            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.run_id}
                  className="hover:bg-slate-800/40 transition"
                >
                  <td className="px-3 py-2 border-b border-slate-800">
                    <Link
                      className="text-teal-400 hover:underline"
                      to={`/runs/${encodeURIComponent(run.run_id)}`}
                    >
                      {run.run_id}
                    </Link>
                  </td>
                  <td className="px-3 py-2 border-b border-slate-800">
                    {run.as_of_date}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-800">
                    {run.portfolio ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-800">
                    {run.irr_target ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-800">
                    {run.status ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-800">
                    {run.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>

          <span className="text-sm text-slate-300">
            Page {page + 1} of {totalPages}
          </span>

          <button
            className="px-3 py-1 rounded bg-slate-800 disabled:opacity-40"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
