//2.1 Get run list (Landing Page)
// routes/runs.ts
import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/", async (req, res) => {
  const pageSize = Number(req.query.pageSize || 25);
  const page = Number(req.query.page || 0);
  const offset = page * pageSize;

  const dataQuery = `
    SELECT run_id, as_of_date, portfolio, irr_target, status,
           started_at, completed_at, created_at
    FROM loan_run
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `SELECT COUNT(*) FROM loan_run`;

  const [data, count] = await Promise.all([
    pool.query(dataQuery, [pageSize, offset]),
    pool.query(countQuery),
  ]);

  res.json({
    rows: data.rows,
    total: Number(count.rows[0].count),
  });
});

export default router;