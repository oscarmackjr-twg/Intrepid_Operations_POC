// Exceptions Grid API (Main Analyst Screen)
// routes/exceptions.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/", async (req, res) => {
  const {
    runId,
    // platform,            // removed: column doesn't exist
    exceptionType,
    severity,
    page = 0,
    pageSize = 50,
  } = req.query;

  if (!runId) {
    return res.status(400).json({ error: "runId is required" });
  }

  const offset = Number(page) * Number(pageSize);

  const filters: string[] = [];
  const values: any[] = [runId];
  let idx = 2;

  // NOTE: platform filter removed because f.platform doesn't exist
  if (exceptionType) {
    filters.push(`e.exception_type = $${idx++}`);
    values.push(exceptionType);
  }
  if (severity) {
    filters.push(`e.severity = $${idx++}`);
    values.push(severity);
  }

  const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

  const dataQuery = `
    SELECT
      e.exception_id,
      e.seller_loan_no,
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

  try {
    const [rows, count] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values),
    ]);

    res.json({
      rows: rows.rows,
      total: Number(count.rows[0].count),
    });
  } catch (err) {
    console.error("Error in GET /api/exceptions:", err);
    res.status(500).json({ error: "Failed to fetch exceptions" });
  }
});

export default router;
