// src/pages/LoanDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Api, LoanDetailResponse } from "../api";

export const LoanDetailPage: React.FC = () => {
  const { runId, loanNo } = useParams<{ runId: string; loanNo: string }>();
  const [data, setData] = useState<LoanDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId || !loanNo) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Api.getLoanDetail(runId, loanNo)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load loan detail");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [runId, loanNo]);

  if (!runId || !loanNo) {
    return <div className="p-4">Missing run or loan identifier.</div>;
  }

  if (loading) {
    return <div className="p-4">Loading loan {loanNo}...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-2">{error}</p>
        <Link
          to={`/runs/${encodeURIComponent(runId)}/exceptions`}
          className="text-blue-600 underline"
        >
          Back to exceptions
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p>Loan not found.</p>
      </div>
    );
  }

  const { loan, exceptions } = data;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Loan {loan.sellerLoanNo} ({loan.platform})
        </h1>
        <Link
          to={`/runs/${encodeURIComponent(runId)}/exceptions`}
          className="text-blue-600 underline"
        >
          ← Back to exceptions
        </Link>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Loan Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="font-medium">Run</div>
            <div>{loan.runId}</div>
          </div>
          <div>
            <div className="font-medium">Program</div>
            <div>{(loan as any).loanProgram ?? "—"}</div>
          </div>
          <div>
            <div className="font-medium">Original Balance</div>
            <div>
              {loan.origBalance != null
                ? loan.origBalance.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                : "—"}
            </div>
          </div>
          <div>
            <div className="font-medium">Purchase Price</div>
            <div>
              {loan.purchasePrice != null
                ? loan.purchasePrice.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                : "—"}
            </div>
          </div>
          <div>
            <div className="font-medium">Current Balance</div>
            <div>
              {loan.currentBalance != null
                ? loan.currentBalance.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })
                : "—"}
            </div>
          </div>
          <div>
            <div className="font-medium">FICO</div>
            <div>{loan.fico ?? "—"}</div>
          </div>
          <div>
            <div className="font-medium">DTI</div>
            <div>{loan.dti != null ? `${loan.dti}%` : "—"}</div>
          </div>
          <div>
            <div className="font-medium">PTI</div>
            <div>{loan.pti != null ? `${loan.pti}%` : "—"}</div>
          </div>
          <div>
            <div className="font-medium">Term (months)</div>
            <div>{loan.termMonths ?? "—"}</div>
          </div>
          <div>
            <div className="font-medium">State</div>
            <div>{loan.state ?? "—"}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Exceptions</h2>
        {exceptions.length === 0 ? (
          <p className="text-sm text-gray-600">No exceptions for this loan.</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">Severity</th>
                  <th className="text-left px-3 py-2">Rule</th>
                  <th className="text-left px-3 py-2">Message</th>
                  <th className="text-left px-3 py-2">Expected</th>
                  <th className="text-left px-3 py-2">Actual</th>
                  <th className="text-left px-3 py-2">Bal. Impact</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((ex) => (
                  <tr key={ex.id} className="border-t">
                    <td className="px-3 py-1">{ex.exceptionType}</td>
                    <td className="px-3 py-1">{ex.severity}</td>
                    <td className="px-3 py-1">{ex.ruleId ?? "—"}</td>
                    <td className="px-3 py-1">{ex.message}</td>
                    <td className="px-3 py-1">
                      {ex.expectedValue != null ? String(ex.expectedValue) : "—"}
                    </td>
                    <td className="px-3 py-1">
                      {ex.actualValue != null ? String(ex.actualValue) : "—"}
                    </td>
                    <td className="px-3 py-1">
                      {ex.balanceImpact != null
                        ? ex.balanceImpact.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default LoanDetailPage;
