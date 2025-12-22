#Loans reviewed
SELECT COUNT(*) AS total_loans
FROM loan_fact
WHERE run_id = :run_id;

#Loans with at least one exception
SELECT COUNT(DISTINCT seller_loan_no) AS loans_with_exceptions
FROM loan_exceptions
WHERE run_id = :run_id;

#% of portfolio flagged
SELECT
    COUNT(DISTINCT e.seller_loan_no)::DECIMAL
    /
    COUNT(DISTINCT f.seller_loan_no) AS pct_flagged
FROM loan_fact f
LEFT JOIN loan_exceptions e
  ON f.run_id = e.run_id
 AND f.seller_loan_no = e.seller_loan_no
WHERE f.run_id = :run_id;

#Balance impacted (loan-level)
SELECT
    SUM(balance_impact) AS total_balance_impact
FROM loan_exceptions
WHERE run_id = :run_id;