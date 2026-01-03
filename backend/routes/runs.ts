// backend/routes/runs.ts
import { Router } from "express";
import { pool } from "../db/pool";
import path from "path";
import fs from "fs";

const router = Router();

// 1) Run list (landing page grid)
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

// 2) CoMAP "not passed" export
//    GET /api/runs/:runId/comap-not-passed
router.get("/:runId/comap-not-passed", async (req, res) => {
  const { runId } = req.params;

  // Pipeline writes to: outputs/<RUN_ID>/comap_not_passed.xlsx
  const repoRoot = process.cwd();
  const filePath = path.join(
    repoRoot,
    "outputs",
    runId,
    "comap_not_passed.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "CoMAP not passed report not found",
      runId,
    });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="comap_not_passed_${runId}.xlsx"`
  );

  return res.sendFile(filePath);
});

export default router;
