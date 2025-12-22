// reactMock.test.ts
function renderExceptionsGrid(rows: any[]) {
  return rows.map(r => ({
    id: r.exception_id,
    loan: r.seller_loan_no,
    type: r.exception_type,
    severity: r.severity,
  }));
}

test("React grid contract holds", () => {
  const apiResponse = [
    {
      exception_id: 1,
      seller_loan_no: "L1",
      exception_type: "COMAP",
      severity: "HIGH",
    },
  ];

  const grid = renderExceptionsGrid(apiResponse);

  expect(grid[0].loan).toBe("L1");
  expect(grid[0].type).toBe("COMAP");
});
