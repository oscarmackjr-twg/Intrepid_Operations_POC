import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Api } from "../api/client";

export default function ExceptionsPage() {
  const { runId } = useParams();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (runId) {
      Api.getExceptions(runId).then(setRows).catch(console.error);
    }
  }, [runId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Exceptions – Run {runId}</h2>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Loan #</th>
            <th>Rule</th>
            <th>Program</th>
            <th>FICO</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.loan_id}</td>
              <td>{r.rule_id}</td>
              <td>{r.loan_program}</td>
              <td>{r.fico}</td>
              <td>{r.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
