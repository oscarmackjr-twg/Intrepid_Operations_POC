// src/pages/RunSummaryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Api, RunSummary } from "../api";
import { PortfolioExceptions } from "../components/PortfolioExceptions";

export const RunSummaryPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Api.getRunSummary(runId)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load run summary");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (!runId) {
    return <div className="p-4">Missing run identifier.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading run {runId}…</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-2">{error}</p>
        <Link to="/runs" className="text-blue-600 underline">
          ← Back to runs
        </Link>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4">
        <p>Run not found.</p>
        <Link to="/runs" className="text-blue-600 underline">
          ← Back to runs
        </Link>
      </div>
    );
  }

  const {
    asOfDate,
    totalLoans,
    loansWithExceptions,
    totalBalance,
    balanceWithExceptions,
  } = summary;

  const exceptionRate =
    totalLoans > 0 ? (loansWithExceptions / totalLoans) * 100 : 0;
  const exceptionBalanceRate =
    totalBalance > 0 ? (balanceWithExceptions / totalBalance) * 100 : 0;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Run {runId}</h1>
          <p className="text-sm text-gray-600">
            As-of date:{" "}
            {asOfDate
              ? new Date(asOfDate).toLocaleDateString()
              : "Not specified"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/runs" className="text-blue-600 underline text-sm">
            ← Back to runs
          </Link>
          <Link
            to={`/runs/${encodeURIComponent(runId)}/exceptions`}
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            View loan exceptions
          </Link>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="border rounded p-3">
          <div className="text-gray-600">Total Loans</div>
          <div className="text-xl font-semibold">{totalLoans}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-600">Loans with Exceptions</div>
          <div className="text-xl font-semibold">{loansWithExceptions}</div>
          <div className="text-xs text-gray-600">
            {exceptionRate.toFixed(1)}% of loans
          </div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-600">Total Balance</div>
          <div className="text-xl font-semibold">
            {totalBalance.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-600">Balance with Exceptions</div>
          <div className="text-xl font-semibold">
            {balanceWithExceptions.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="text-xs text-gray-600">
            {exceptionBalanceRate.toFixed(1)}% of balance
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">
          Portfolio Eligibility Exceptions
        </h2>
        <PortfolioExceptions runId={runId} />
      </section>
    </div>
  );
};

export default RunSummaryPage;
