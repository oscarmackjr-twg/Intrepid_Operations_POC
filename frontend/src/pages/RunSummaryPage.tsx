// src/pages/RunSummaryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Api } from "../api";
import type { RunSummary } from "../api";

export const RunSummaryPage: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();

  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await Api.getRunSummary(runId);
        setSummary(data);
      } catch (err: any) {
        console.error("Failed to fetch run summary", err);
        setError(err?.message ?? "Failed to fetch run summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [runId]);

  if (!runId) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No runId provided in URL.</p>
        <Link to="/">Back to runs</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Run Summary</h1>
      <p>
        <strong>Run ID:</strong> {runId}
      </p>

      <p>
        <Link to="/">← Back to runs</Link>
      </p>

      {loading && <p>Loading summary…</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {summary && !loading && !error && (
        <div
          style={{
            marginTop: "16px",
            display: "inline-block",
            padding: "12px 16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <p>
            <strong>Total Loans:</strong> {summary.totalLoans}
          </p>
          <p>
            <strong>Loans with Exceptions:</strong> {summary.loansWithExceptions}
          </p>
          <p>
            <strong>Balance Impact:</strong> {summary.balanceImpact}
          </p>
          <p>
            <Link to={`/runs/${runId}/exceptions`}>
              View Exceptions →
            </Link>
          </p>

        </div>
      )}
    </div>
  );
};
