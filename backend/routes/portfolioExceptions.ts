//Portfolio Eligibility Exceptions API
// routes/portfolioExceptions.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/:runId", async (req, res) => {
  const { runId } = req.params;

  const result = await pool.query(
    `
    SELECT rule_id, platform, severity,
           expected_value, actual_value,
           difference, balance_impact, created_at
    FROM portfolio_exceptions
    WHERE run_id = $1
    ORDER BY severity DESC, balance_impact DESC
    `,
    [runId]
  );

  res.json(result.rows);
});

export default router;