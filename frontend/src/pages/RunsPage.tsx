import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../api/client";

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Api.getRuns().then(setRuns).catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Loan Review Runs</h2>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Run ID</th>
            <th>As Of Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(r => (
            <tr
              key={r.run_id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/runs/${r.run_id}`)}
            >
              <td>{r.run_id}</td>
              <td>{r.as_of_date}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
