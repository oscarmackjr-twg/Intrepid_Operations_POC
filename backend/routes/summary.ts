// routes/summary.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

/**
 * GET /api/summary/:runId
 * Returns:
 * {
 *   runId: string;
 *   totalLoans: number;          // distinct loans in exceptions
 *   loansWithExceptions: number; // total exception rows (matches pipeline exceptionCount)
 *   balanceImpact: number;       // sum of balance_impact
 * }
 */
router.get("/:runId", async (req, res) => {
  const { runId } = req.params;

  if (!runId) {
    return res.status(400).json({ error: "runId is required" });
  }

  try {
    const [loanCountsRes, exceptionRowsRes, balanceImpactRes] = await Promise.all([
      // 1) distinct loans that appear in exceptions (stand-in for total loans for now)
      pool.query(
        `
        SELECT COUNT(DISTINCT seller_loan_no)::int AS total_loans
        FROM loan_exceptions
        WHERE run_id = $1
        `,
        [runId]
      ),

      // 2) total exception rows – matches pipeline exceptionCount
      pool.query(
        `
        SELECT COUNT(*)::int AS exception_rows
        FROM loan_exceptions
        WHERE run_id = $1
        `,
        [runId]
      ),

      // 3) total balance impact from all exceptions for the run
      pool.query(
        `
        SELECT COALESCE(SUM(balance_impact), 0) AS balance_impact
        FROM loan_exceptions
        WHERE run_id = $1
        `,
        [runId]
      ),
    ]);

    const totalLoans = loanCountsRes.rows[0]?.total_loans ?? 0;
    const loansWithExceptions = exceptionRowsRes.rows[0]?.exception_rows ?? 0;
    const balanceImpact = Number(balanceImpactRes.rows[0]?.balance_impact ?? 0);

    return res.json({
      runId,
      totalLoans,
      loansWithExceptions,
      balanceImpact,
    });
  } catch (err) {
    console.error("Error in GET /api/summary/:runId", err);
    return res.status(500).json({ error: "Failed to fetch run summary" });
  }
});

export default router;
