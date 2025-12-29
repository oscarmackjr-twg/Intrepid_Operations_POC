// routes/summary.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/:runId", async (req, res, next) => {
  try {
    const runId = req.params.runId; // "TEST_RUN_001"

    if (!runId) {
      return res.status(400).json({ error: "runId is required" });
    }

    const totalLoansQuery = `
      SELECT COUNT(*) AS count
      FROM loan_fact
      WHERE run_id = $1
    `;

    const loansWithExceptionsQuery = `
      SELECT COUNT(DISTINCT seller_loan_no) AS count
      FROM loan_exceptions
      WHERE run_id = $1
    `;

    const balanceImpactQuery = `
      SELECT COALESCE(SUM(balance_impact), 0) AS total_impact
      FROM loan_exceptions
      WHERE run_id = $1
    `;

    const [totalLoansResult, loansWithExResult, balanceImpactResult] =
      await Promise.all([
        pool.query(totalLoansQuery, [runId]),
        pool.query(loansWithExceptionsQuery, [runId]),
        pool.query(balanceImpactQuery, [runId]),
      ]);

    const totalLoans = Number(totalLoansResult.rows[0]?.count ?? 0);
    const loansWithExceptions = Number(loansWithExResult.rows[0]?.count ?? 0);
    const balanceImpact = Number(
      balanceImpactResult.rows[0]?.total_impact ?? 0
    );

    res.json({
      runId,
      totalLoans,
      loansWithExceptions,
      balanceImpact,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
