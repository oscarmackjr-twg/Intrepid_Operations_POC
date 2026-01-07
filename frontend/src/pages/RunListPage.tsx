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

        // Defensive parsing: support { rows, total } or plain array
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
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Loan Engine Runs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View the history of portfolio optimization runs and drill into
            detailed summaries and exceptions.
          </p>
        </div>
        {/* Optional “New Run” action – hook up when ready */}
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-[--color-brand-primary] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[--color-brand-accent] focus:outline-none focus:ring-2 focus:ring-[--color-brand-primary] focus:ring-offset-2"
          disabled
          title="Hook this up to your run trigger when backend is ready"
        >
          New Run
        </button>
      </div>

      {/* Status messages */}
      {loading && (
        <div className="text-sm text-slate-500">
          Loading runs&hellip;
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Error loading runs</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">No runs found.</p>
          <p className="mt-1">
            If you just ran the pipeline, try refreshing the page. Also check
            the browser console for the <code>Api.getRuns()</code> log.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && runs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 border-b border-slate-200">
                  Run ID
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  As Of Date
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Portfolio
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  IRR Target
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Status
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Created At
                </th>
              </tr>
            </thead>

            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.run_id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2 border-b border-slate-100">
                    <Link
                      className="text-[--color-brand-primary] hover:underline font-medium"
                      to={`/runs/${encodeURIComponent(run.run_id)}`}
                    >
                      {run.run_id}
                    </Link>
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {run.as_of_date}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {run.portfolio ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {run.irr_target ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {run.status ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
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
        <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
          <div>
            Showing{" "}
            <span className="font-medium">
              {runs.length === 0 ? 0 : page * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {page * pageSize + runs.length}
            </span>{" "}
            of{" "}
            <span className="font-medium">
              {total}
            </span>{" "}
            runs
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>

            <span className="text-xs text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-700">
                {page + 1}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {totalPages}
              </span>
            </span>

            <button
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
