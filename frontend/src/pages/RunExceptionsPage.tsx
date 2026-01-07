import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Api } from "../api";
import type { RunException } from "../api";

type ExceptionRow = RunException;

export const RunExceptionsPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();

  const [rows, setRows] = useState<ExceptionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const pageSize = 25;

  useEffect(() => {
    if (!runId) return;

    const fetchExceptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await Api.getExceptions(runId);
        console.log("✔ getExceptions result:", result);

        setRows(result);
      } catch (err: any) {
        const message = err?.message ?? String(err);
        console.error("✖ Failed to fetch exceptions", err);

        // Treat 404 as "no exceptions" instead of hard error
        if (typeof message === "string" && message.includes("status 404")) {
          console.warn(
            "Exceptions endpoint returned 404; treating as 'no exceptions for this run'."
          );
          setRows([]);
          setError(null);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExceptions();
  }, [runId]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageRows = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, page, pageSize]);

  if (!runId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Run Exceptions
        </h1>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          No run ID was provided in the URL.
        </div>
        <Link
          to="/"
          className="inline-flex text-sm text-[--color-brand-primary] hover:underline"
        >
          ← Back to all runs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Run Exceptions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Detailed list of portfolio eligibility exceptions for run{" "}
            <span className="font-mono font-semibold text-slate-800">
              {runId}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/runs/${encodeURIComponent(runId)}`}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Summary
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            All Runs
          </Link>
        </div>
      </div>

      {/* Status messages */}
      {loading && (
        <div className="text-sm text-slate-500">
          Loading exceptions…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Error loading exceptions</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">
            No portfolio eligibility exceptions found for this run.
          </p>
          <p className="mt-1">
            This may mean the pipeline did not produce any portfolio exceptions,
            or the backend does not yet expose exception data for this run.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-[0.7rem] md:text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 border-b border-slate-200">
                  Rule ID
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Platform
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Severity
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Expected
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Actual
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Difference
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Balance Impact
                </th>
                <th className="px-3 py-2 border-b border-slate-200">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => (
                <tr
                  key={`${row.rule_id}-${idx}-${row.created_at}`}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.rule_id}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.platform ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    <span
                      className={
                        row.severity === "High"
                          ? "inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200"
                          : row.severity === "Medium"
                          ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200"
                          : "inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200"
                      }
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.expected_value ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.actual_value ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.difference ?? "—"}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100 text-right font-mono text-xs">
                    {row.balance_impact.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-2 border-b border-slate-100">
                    {row.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && rows.length > 0 && (
        <div className="flex items-center justify-between gap-4 text-xs md:text-sm text-slate-600">
          <div>
            Showing{" "}
            <span className="font-medium">
              {total === 0 ? 0 : page * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min((page + 1) * pageSize, total)}
            </span>{" "}
            of{" "}
            <span className="font-medium">{total}</span> exceptions
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>

            <span className="text-[0.7rem] md:text-xs text-slate-500">
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
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs md:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
