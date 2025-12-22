// routes/summary.ts
import { Router } from "express";
import { pool } from "../db/pool.ts";

const router = Router();

router.get("/:runId", async (req, res) => {
  const { runId } = req.params;

  const queries = {
    totalLoans: `
      SELECT COUNT(*) FROM loan_fact WHERE run_id = $1
    `,
    loansWithExceptions: `
      SELECT COUNT(DISTINCT seller_loan_no)
      FROM loan_exceptions WHERE run_id = $1
    `,
    balanceImpact: `
      SELECT COALESCE(SUM(balance_impact), 0)
      FROM loan_exceptions WHERE run_id = $1
    `,
  };

  const [total, flagged, impact] = await Promise.all([
    pool.query(queries.totalLoans, [runId]),
    pool.query(queries.loansWithExceptions, [runId]),
    pool.query(queries.balanceImpact, [runId]),
  ]);

  res.json({
    totalLoans: Number(total.rows[0].count),
    loansWithExceptions: Number(flagged.rows[0].count),
    balanceImpact: Number(impact.rows[0].coalesce),
  });
});

export default router;