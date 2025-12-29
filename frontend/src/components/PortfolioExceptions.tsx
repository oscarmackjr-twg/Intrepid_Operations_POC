// src/components/PortfolioExceptions.tsx

import React, { useEffect, useState } from "react";
import { Api } from "../api";

export interface PortfolioExceptionRow {
  exception_id: number;
  seller_loan_no: string;
  platform: string | null;
  loan_program: string | null;
  exception_type: string;
  rule_id: string | null;
  severity: string | null;
  balance_impact: number | null;
  expected_value: number | null;
  actual_value: number | null;
  difference: number | null;
  created_at: string;
}

interface ApiResponse {
  runId: string;
  total: number;
  rows: PortfolioExceptionRow[];
}

interface PortfolioExceptionsProps {
  runId: string;
  pageSize?: number;
}

export const PortfolioExceptions: React.FC<PortfolioExceptionsProps> = ({
  runId,
  pageSize = 5,
}) => {
  const [rows, setRows] = useState<PortfolioExceptionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (pageToLoad: number) => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse = await Api.getExceptions({
        runId,
        page: pageToLoad,
        pageSize,
      });

      setRows(response.rows);
      setTotal(response.total);
      setPage(pageToLoad);
    } catch (e: any) {
      console.error("Failed to load portfolio exceptions", e);
      setError(e?.message || "Failed to load portfolio exceptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (runId) {
      loadData(0);
    }
  }, [runId]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-6 border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Portfolio Exceptions (top {pageSize})
        </h2>
        <div className="text-sm text-gray-500">
          Total exceptions for run: {total}
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {error && (
        <div className="text-sm text-red-600 mb-2">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-sm text-gray-500">
          No exceptions found for this run.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-2 py-1 text-left">Loan</th>
                  <th className="px-2 py-1 text-left">Platform</th>
                  <th className="px-2 py-1 text-left">Program</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Rule</th>
                  <th className="px-2 py-1 text-left">Severity</th>
                  <th className="px-2 py-1 text-right">Impact</th>
                  <th className="px-2 py-1 text-right">Δ</th>
                  <th className="px-2 py-1 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.exception_id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-1">{row.seller_loan_no}</td>
                    <td className="px-2 py-1">{row.platform ?? "-"}</td>
                    <td className="px-2 py-1">{row.loan_program ?? "-"}</td>
                    <td className="px-2 py-1">{row.exception_type}</td>
                    <td className="px-2 py-1">{row.rule_id ?? "-"}</td>
                    <td className="px-2 py-1">{row.severity ?? "-"}</td>
                    <td className="px-2 py-1 text-right">
                      {row.balance_impact != null ? row.balance_impact.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {row.difference != null ? row.difference.toFixed(4) : "-"}
                    </td>
                    <td className="px-2 py-1 text-left">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
              <button
                type="button"
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => loadData(page - 1)}
                disabled={page === 0 || loading}
              >
                Prev
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => loadData(page + 1)}
                disabled={page + 1 >= totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
