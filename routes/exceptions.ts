// routes/exceptions.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const runId = String(req.query.runId || "");

    if (!runId) {
      return res.status(400).json({ error: "runId is required" });
    }

    const sellerLoanNo = req.query.sellerLoanNo as string | undefined;
    const ruleId = req.query.ruleId as string | undefined;
    const severity = req.query.severity as string | undefined;

    const params: any[] = [runId];
    const whereParts: string[] = ["e.run_id = $1"];

    if (sellerLoanNo) {
      params.push(sellerLoanNo);
      whereParts.push(`e.seller_loan_no = $${params.length}`);
    }

    if (ruleId) {
      params.push(ruleId);
      whereParts.push(`e.rule_id = $${params.length}`);
    }

    if (severity) {
      params.push(severity);
      whereParts.push(`e.severity = $${params.length}`);
    }

    const whereClause =
      whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const pageSize = Number(req.query.pageSize || 50);
    const page = Number(req.query.page || 0);
    const offset = page * pageSize;

    params.push(pageSize, offset);
    const limitIndex = params.length - 1; // last two entries are limit/offset

    const dataQuery = `
      SELECT
        e.exception_id,
        e.seller_loan_no,
        f.platform,
        f.loan_program,
        e.exception_type,
        e.rule_id,
        e.severity,
        e.balance_impact,
        e.expected_value,
        e.actual_value,
        e.difference,
        e.created_at
      FROM loan_exceptions e
      JOIN loan_fact f
        ON e.run_id = f.run_id
       AND e.seller_loan_no = f.seller_loan_no
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT $${limitIndex} OFFSET $${limitIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) AS count
      FROM loan_exceptions e
      JOIN loan_fact f
        ON e.run_id = f.run_id
       AND e.seller_loan_no = f.seller_loan_no
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, params),
      pool.query(countQuery, params.slice(0, params.length - 2)), // no limit/offset for count
    ]);

    res.json({
      runId,
      total: Number(countResult.rows[0].count),
      rows: dataResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
