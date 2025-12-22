// Exceptions Grid API (Main Analyst Screen)
// routes/exceptions.ts
import { Router } from "express";
import { pool } from "../db/pool.ts";

const router = Router();

router.get("/", async (req, res) => {
  const {
    runId,
    platform,
    exceptionType,
    severity,
    page = 0,
    pageSize = 50,
  } = req.query;

  const offset = Number(page) * Number(pageSize);

  const filters = [];
  const values: any[] = [runId];
  let idx = 2;

  if (platform) {
    filters.push(`f.platform = $${idx++}`);
    values.push(platform);
  }
  if (exceptionType) {
    filters.push(`e.exception_type = $${idx++}`);
    values.push(exceptionType);
  }
  if (severity) {
    filters.push(`e.severity = $${idx++}`);
    values.push(severity);
  }

  const whereClause = filters.length
    ? `AND ${filters.join(" AND ")}`
    : "";

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
      e.created_at
    FROM loan_exceptions e
    JOIN loan_fact f
      ON e.run_id = f.run_id
     AND e.seller_loan_no = f.seller_loan_no
    WHERE e.run_id = $1
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM loan_exceptions e
    JOIN loan_fact f
      ON e.run_id = f.run_id
     AND e.seller_loan_no = f.seller_loan_no
    WHERE e.run_id = $1
    ${whereClause}
  `;

  const dataValues = [...values, pageSize, offset];

  const [rows, count] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, values),
  ]);

  res.json({
    rows: rows.rows,
    total: Number(count.rows[0].count),
  });
});

export default router