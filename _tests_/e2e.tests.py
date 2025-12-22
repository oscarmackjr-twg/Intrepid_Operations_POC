// __tests__/e2e.test.ts
import request from "supertest";
import app from "../app";
import { pool } from "../db/pool";

describe("E2E: Node → Python → DB → React Mock", () => {
  let runId: string;

  beforeAll(async () => {
    await pool.query("DELETE FROM loan_exceptions");
    await pool.query("DELETE FROM loan_run");
  });

  it("runs the rule engine", async () => {
    const res = await request(app)
      .post("/api/run")
      .send({ asOfDate: "2024-06-01" });

    expect(res.status).toBe(202);
    runId = res.body.runId;
  });

  it("waits for completion", async () => {
    let status = "RUNNING";

    for (let i = 0; i < 10 && status === "RUNNING"; i++) {
      const res = await request(app)
        .get(`/api/runs/${runId}/status`);

      status = res.body.status;
      await new Promise(r => setTimeout(r, 500));
    }

    expect(status).toBe("COMPLETED");
  });

  it("returns CoMAP exceptions to React", async () => {
    const res = await request(app)
      .get(`/api/exceptions?runId=${runId}`);

    expect(res.body.rows.length).toBe(3);

    const loans = res.body.rows.map((r: any) => r.seller_loan_no);
    expect(loans).toContain("L1");
    expect(loans).toContain("L3");
    expect(loans).toContain("L4");
  });
});
