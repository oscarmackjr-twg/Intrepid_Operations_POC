// routes/loanDetail.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/:runId/:loanNo", async (req, res) => {
  const { runId, loanNo } = req.params;

  const loanQuery = `
    SELECT *
    FROM loan_fact
    WHERE run_id = $1 AND seller_loan_no = $2
  `;

  const exceptionsQuery = `
    SELECT rule_id, exception_type, severity,
           expected_value, actual_value, difference, created_at
    FROM loan_exceptions
    WHERE run_id = $1 AND seller_loan_no = $2
    ORDER BY created_at
  `;

  const [loan, exceptions] = await Promise.all([
    pool.query(loanQuery, [runId, loanNo]),
    pool.query(exceptionsQuery, [runId, loanNo]),
  ]);

  res.json({
    loan: loan.rows[0],
    exceptions: exceptions.rows,
  });
});

export default router;