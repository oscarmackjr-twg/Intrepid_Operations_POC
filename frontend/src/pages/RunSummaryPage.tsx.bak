import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Api } from "../api/client";

export default function RunSummaryPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (runId) {
      Api.getRunSummary(runId).then(setSummary).catch(console.error);
    }
  }, [runId]);

  if (!summary) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Run Summary – {runId}</h2>

      <ul>
        <li>Total Loans: {summary.total_loans}</li>
        <li>Total Exceptions: {summary.total_exceptions}</li>
        <li>CoMAP Exceptions: {summary.comap_exceptions}</li>
      </ul>

      <button onClick={() => navigate(`/runs/${runId}/exceptions`)}>
        View Exceptions
      </button>
    </div>
  );
}
