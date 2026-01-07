import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Api } from "../api";
import type { RunSummary } from "../api";

export const RunSummaryPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();

  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Central fetch function
   * - called on load
   * - called when runId changes
   * - called when user presses Refresh button
   */
  const fetchSummary = useCallback(async () => {
    if (!runId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await Api.getRunSummary(runId);
      console.log("✔ getRunSummary result:", result);

      setSummary(result);
    } catch (err: any) {
      const message = err?.message ?? String(err);
      console.error("✖ Failed to fetch run summary", err);

      // Special case: treat 404 as "no summary" (not a hard error)
      if (typeof message === "string" && message.includes("status 404")) {
        console.warn(
          "Summary endpoint returned 404; treating as 'no summary available'."
        );
        setSummary(null);
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (!runId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Run Summary
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

  const exceptionRate =
    summary && summary.totalLoans > 0
      ? (summary.loansWithExceptions / summary.totalLoans) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Run Summary
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of key metrics for run{" "}
            <span className="font-mono font-semibold text-slate-800">
              {runId}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Refreshing…" : "Refresh Summary"}
          </button>

          <Link
            to={`/runs/${encodeURIComponent(runId)}/exceptions`}
            className="inline-flex items-center rounded-full bg-[--color-brand-primary] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[--color-brand-accent] focus:outline-none focus:ring-2 focus:ring-[--color-brand-primary] focus:ring-offset-2"
          >
            View Exceptions
          </Link>
        </div>
      </div>

      {/* Status messages */}
      {loading && !summary && (
        <div className="text-sm text-slate-500">
          Loading summary…
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Error loading summary</p>
          <p>{error}</p>
        </div>
      )}

      {/* No summary available (either truly empty or 404) */}
      {!loading && !error && !summary && (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">
            No summary available for this run.
          </p>
          <p className="mt-1">
            This may mean the backend does not yet expose a summary endpoint for
            this run.
          </p>
        </div>
      )}

      {/* Metrics cards */}
      {!error && summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Loans
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.totalLoans.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Loans with Exceptions
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.loansWithExceptions.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {exceptionRate.toFixed(1)}% of portfolio
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Balance Impact
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.balanceImpact.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Net change in portfolio balance from flagged loans.
            </div>
          </div>
        </div>
      )}

      {/* Link to exceptions */}
      {summary && (
        <div className="pt-2 text-sm">
          <Link
            to={`/runs/${encodeURIComponent(runId)}/exceptions`}
            className="text-[--color-brand-primary] hover:underline"
          >
            View detailed exception list →
          </Link>
        </div>
      )}
    </div>
  );
};
