// backend/__tests__/summary.test.ts
import request from "supertest";
import { Pool } from "pg";
import app from "../app";

// Use same connection string as the app (or DATABASE_URL_TEST if you prefer)
const connectionString =
  process.env.DATABASE_URL || process.env.DATABASE_URL_TEST;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (or DATABASE_URL_TEST) is not set for tests. " +
      "Set it to your Postgres connection string before running npm test."
  );
}

const pool = new Pool({ connectionString });

// Use a valid UUID for the test run (matches loan_run.run_id type)
const TEST_RUN_ID = "11111111-1111-1111-1111-111111111111";

beforeAll(async () => {
  // Clean tables and insert a known run + data
  await pool.query("TRUNCATE loan_exceptions, loan_fact, loan_run CASCADE;");

  await pool.query(
    `
    INSERT INTO loan_run (run_id, as_of_date, status, irr_target)
    VALUES ($1::uuid, $2, 'COMPLETED', 8.05)
  `,
    [TEST_RUN_ID, "2025-11-18"]
  );

  await pool.query(
    `
      INSERT INTO loan_fact
        (run_id, seller_loan_no, platform, orig_balance, purchase_price, current_balance)
      VALUES
        ($1::uuid, 'SFC_1', 'PRIME', 1000, 900, 900),
        ($1::uuid, 'SFC_2', 'PRIME', 2000, 1800, 1800)
    `,
    [TEST_RUN_ID]
  );

  // Note: we don't set balance_impact here, so it will be NULL → COALESCE(...) = 0
  await pool.query(
    `
      INSERT INTO loan_exceptions
        (run_id, seller_loan_no, rule_id, exception_type, severity, message)
      VALUES
        ($1::uuid, 'SFC_1', 'RULE_TEST', 'PURCHASE_PRICE', 'ERROR', 'Test exception')
    `,
    [TEST_RUN_ID]
  );
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/summary/:runId", () => {
  it("returns summary for a run", async () => {
    const res = await request(app).get(`/api/summary/${TEST_RUN_ID}`);

    expect(res.status).toBe(200);

    // Shape actually returned by backend/routes/summary.ts
    expect(res.body.totalLoans).toBe(2);
    expect(res.body.loansWithExceptions).toBe(1);

    // balanceImpact comes from COALESCE(SUM(balance_impact), 0)
    // We inserted a row with NULL balance_impact → expect 0
    expect(res.body.balanceImpact).toBe(0);
  });
});
